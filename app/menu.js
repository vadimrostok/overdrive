                

define([
        'three',
        'font'
    ], 
    function(THREE) {

        var menu = new (function() {

            var inited = false;

            var textMeshes = [], geometry = [], i = 0;

            var setText = function() {

                var geometry = new THREE.Geometry(), newGeometry, mesh;
                var textHeight = 0.1;
                var params = {
                    size: 0.5,
                    height: textHeight,
                    font: 'helvetiker',
                    weight: 'bold',
                    style: 'normal',
                };

                for(var i = 0, l = arguments.length; i < l; i++) {

                    var xyz = arguments[i][0];
                    var rot_xyz = arguments[i][1];
                    var text = arguments[i][2];

                    if(arguments[i][3]) {
                        newGeometry = new THREE.TextGeometry(text, {
                            size: arguments[i][3],
                            height: textHeight,
                            font: 'helvetiker',
                            weight: 'bold',
                            style: 'normal',
                        });
                    } else {
                        newGeometry = new THREE.TextGeometry(text, params);
                    }

                    THREE.GeometryUtils.center(newGeometry);

                    mesh = new THREE.Mesh(newGeometry);

                    mesh.rotation.set(rot_xyz[0], rot_xyz[1], rot_xyz[2]);
                    mesh.position.set(xyz[0], xyz[1], textHeight / 2 + xyz[2]);

                    THREE.GeometryUtils.merge(geometry, mesh);

                };

                mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                    color: 0x0099ff,
                    combine: THREE.MixOperation,
                    reflectivity: 0.7
                }));

                return mesh;

            };

            var turn = [0, 0, 0];

            var height = 3.5;
            var width = height * window.innerWidth / window.innerHeight;

            var menuMesh = setText(
                [[0, 0.8 * height, 0],      turn, 'Accelerate'],
                [[0, -0.8 * height, 0],     turn, 'Brake'],
                [[-0.8 * width, 0, 0],      turn, 'Left'],
                [[0.8 * width, 0, 0],       turn, 'Right'],
                [[0, height / 2 - .2, 0],   turn, 'Spin mousewheel to change gears', .3],
                [[0, 0.3, 0],               turn, 'Click to start'],
                [[0, -0.3, 0],              turn, 'the game']
            );

            this.mesh;

            this.init = function() {

                scene.add(menuMesh);

                this.mesh = menuMesh;

                inited = true;

            };

            this.process = function() {

                if(!inited) {

                    this.init();

                }

            };

            this.mouse = function(meta, type, e) {

                if(type == 'move') {

                    this.swing(e.clientX, e.clientY);

                } else if(type == 'click') {

                    meta.changeState();

                };

            };

            this.swing = function(x, y) {

                //menuMesh
                menuMesh.rotation.y = (x / window.innerWidth - 0.5) * Math.PI / 180 * 40;

                menuMesh.rotation.x = (y / window.innerHeight - 0.5) * Math.PI / 180 * 40;


            };

            this.info = function() {

                return [
                    'MENU',
                    []
                ];

            };

        })();

        return menu;
        
    }
);