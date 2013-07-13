var container, stats;

var camera, scene, renderer, directionalLight, skyBox;

var delta;

var process, start;

var lights = {
    directional: null,
    headlights: null,
    backlights: null
};

//Рисует серую сетку. Уравнение плоскости: x = z; y = 0;
function grid(size) {

    var step = 1, k = 100;

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( { color: 0xffffff } );

    for ( var i = - size / k; i <= size / k; i += step ) {

        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

    };

    for ( var i = - size / k; i <= size / k; i += step ) {

        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    };

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

        window.loader = new THREE.JSONLoader(true);

        start = function() {

            //camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
            camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
            camera.position.set( 0, 0, 0 );
            camera.lookAt( new THREE.Vector3() );

            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0xffffff, 0.00025);

            lights.directional = new THREE.DirectionalLight(0xccccff, 2);
            lights.directional.offset = {x: 5, y: 7, z: 3};
            lights.directional.position.set(3, 7, 3);
            lights.directional.castShadow = true;
            lights.directional.shadowCameraVisible = true;

            lights.directional.shadowCameraNear = 5;
            lights.directional.shadowCameraFar = 15;
            lights.directional.shadowCameraLeft = -5;
            lights.directional.shadowCameraRight = 5;
            lights.directional.shadowCameraTop = 5;
            lights.directional.shadowCameraBottom = -5;

            lights.directional.shadowDarkness = 0.8;

            scene.add(lights.directional);

            var imagePrefix = 'data/textures/box/interstellar-';
            var directions  = ['xpos', 'xneg', 'ypos', 'yneg', 'zpos', 'zneg'];
            var imageSuffix = '.jpg';
            var skyGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );   
            
            var materialArray = [], textureArray = [];
            
            for (var i = 0; i < 6; i++) {

                textureArray[i] = imagePrefix + directions[i] + imageSuffix;

                materialArray.push(new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture( textureArray[i] ),
                    side: THREE.BackSide
                }));

            };

            var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
            skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
            scene.add(skyBox);

            var textureCube = THREE.ImageUtils.loadTextureCube( textureArray );

            app.data.carMaterial = new THREE.MeshLambertMaterial( {
                color: 0xdd4411,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.4
            });

            var floorTexture = new THREE.ImageUtils.loadTexture( 'data/textures/checkerboard.jpg' );
            floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
            floorTexture.repeat.set( 100, 100 );
            var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture,  /*transparent: true, opacity: 0.5,*/envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.4 } );
            var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
            var floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.y = 0;
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);
            window.floor=floor

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x101010, 1);

            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;

            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            stats.domElement.style.zIndex = 100;

            document.body.appendChild(stats.domElement);

            document.body.appendChild(renderer.domElement);

            meta.changeState();

            process();

        };

        process = (function(clock) {

            return function() {

                delta = clock.getDelta();

                //Если я перешел на другую вкладку или т.п.?
                if(delta > 0.07) {
                    delta = 0.05;
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