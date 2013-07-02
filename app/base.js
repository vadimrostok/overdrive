var container, stats;

var camera, scene, renderer, directionalLight;

var delta;

var process, start;

//Рисует серую сетку. Уравнение плоскости: x = z; y = 0;
function grid(size) {

    var step = 1;

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( { color: 0xc0c0c0 } );

    for ( var i = - size; i <= size; i += step ) {

        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    }

    return new THREE.Line( geometry, material, THREE.LinePieces );

}

//Рисует 3 разноцветных вектора в положительных направлениях осей.
function org() {

    var geometry, material;

    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( 10, 0, 0 ) );
    scene.add(new THREE.Line( geometry, material, THREE.LinePieces ));

    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial( { color: 0x00ff00 } );
    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( 0, 10, 0 ) );
    scene.add(new THREE.Line( geometry, material, THREE.LinePieces ));

    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( 0, 0, 10 ) );
    scene.add(new THREE.Line( geometry, material, THREE.LinePieces ));

}

//Рисует вектор по двум точкам и цвету.
function vec(p1, p2, c) {

    var geometry, material, line;

    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial( { color: c } );
    geometry.vertices.push( p1 );
    geometry.vertices.push( p2 );
    line = new THREE.Line( geometry, material, THREE.LinePieces );
    scene.add(line);

    return line;

}

//Рисует точку-сферу.
function dot(x, y, z) {

    var mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;

    scene.add( mesh );

    return mesh;

};

//Просто обетка.
function quaternion(xyz, angle) {

    var half_angle = angle * 0.5;
    sin_a = Math.sin(half_angle);
    return new THREE.Quaternion(xyz[0] * sin_a, xyz[1] * sin_a, xyz[2] * sin_a, Math.cos(half_angle));

};

var keysModel = function() {
    var pressComplete = function(code) {
        keysBuffer[code].isEven = (++keysBuffer[code].pressedCount % 2 == 0);
    };
    var keysBuffer = {};
    var checkKeyObjectExistence = function(code) {
        if(!keysBuffer[code]) {
            keysBuffer[code] = {
                pressedCount: 0,
                isEven: true,
                isPressed: false
            }
        }
    };
    var onKeys = {};
    this.down = function(e) {
        checkKeyObjectExistence(e.keyCode);
        keysBuffer[e.keyCode].isPressed = true;
    };
    this.up = function(e) {
        checkKeyObjectExistence(e.keyCode);
        pressComplete(e.keyCode);
        keysBuffer[e.keyCode].isPressed = false;
        if(onKeys[e.keyCode]) {
            onKeys[e.keyCode](e);
        }
    };
    this.info = function(key, onlyIsPressed) {
        var obj;
        switch(key) {
            case 'up':      obj = keysBuffer[38]; break;
            case 'down':    obj = keysBuffer[40]; break;
            case 'left':    obj = keysBuffer[37]; break;
            case 'right':   obj = keysBuffer[39]; break;
            case 'esc':     obj = keysBuffer[27]; break;
            case 'shift':   obj = keysBuffer[16]; break;
            case 'ctrl':    obj = keysBuffer[17]; break;
            default:        obj = (typeof key == 'string')? keysBuffer[key.charCodeAt()]: keysBuffer[key.charCodeAt()] || false;
        }
        return (obj && onlyIsPressed)? obj.isPressed: obj;
    };
    this.on = function(key, f) {
        onKeys[key] = f;
    }
}, keys = new keysModel();

document.addEventListener('keydown', keys.down, true);
document.addEventListener('keyup', keys.up, true);

var info = function() {

    //document.getElementById('info').innerHTML = '';
    
    var html = '';

    for(var i = 0; i < arguments.length; i++) {

        if(typeof arguments[i][0] == 'string') {

            html += '<div class="info">' + arguments[i][0] + '<br />';

        } else {

            html += '<div class="info ' + arguments[i][0][1] + '">' + arguments[i][0][0] + '<br />';

        };

        for(var j = 1; j < arguments[i].length; j++) {

            html += arguments[i][j][0] + ': ' + arguments[i][j][1] + '<br/>';

        }

        html += '</div>';

    };

    document.getElementById('info').innerHTML = html;

};

define([
        'three',
        'meta',
        'stats'
    ], 
    function(THREE, meta, Stats) {

        start = function() {

            camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
            camera.position.set( 15, 15, 15 );

            scene = new THREE.Scene();
            scene.add(grid(100));

            directionalLight = new THREE.DirectionalLight(0xffffff, 3);
            directionalLight.position.x = 5;
            directionalLight.position.y = 5;
            directionalLight.position.z = 5;
            directionalLight.position.normalize();
            scene.add(directionalLight);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xffffff, 1);

            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            stats.domElement.style.zIndex = 100;

            document.body.appendChild(stats.domElement);

            document.body.appendChild(renderer.domElement);

            process();

        };

        process = (function(clock) {

            return function() {

                delta = clock.getDelta();

                //Если я перешел на другую вкладку или т.п.?
                if(delta > 0.1) {
                    delta = 0.1;
                }

                //Точка входа в точки входа игровой логики.
                meta.process();

                //setTimeout для симулирования низкого FPS.
                //setTimeout(function() {

                    requestAnimationFrame( process );

                //}, 0);

                renderer.render( scene, camera );

                stats.update();

            };        

        })(new THREE.Clock());

        return start;

    }
);