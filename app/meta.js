define([
        'game',
        'menu'
    ], 
    function(game, menu) {

        var meta = new (function() {

            var meta = this;

            //menu || game
            var state = 'game';

            document.addEventListener('mousemove', function(e) {

                if(state == 'menu') {

                    menu.mouse(meta, 'move', e);

                } else {

                    game.mouse(meta, 'move', e);

                };

            });

            document.addEventListener('click', function(e) {

                if(state == 'menu') {

                    menu.mouse(meta, 'click', e);

                } else {

                    game.mouse(meta, 'click', e);

                };

            });

            document.addEventListener('mousewheel', function(e) {

                var direction;

                if (event.wheelDelta) {

                    direction = (window.opera)? event.wheelDelta / 120: -event.wheelDelta / 120;
                    
                } else if (event.detail) {
                    
                    direction = -event.detail / 3;

                };

                direction *= -1;

                if(state == 'menu') {

                    menu.mouse(meta, 'wheel', direction);

                } else {

                    game.mouse(meta, 'wheel', direction);

                };

            });

            this.process = function() {

                if(state == 'menu') {
                    menu.process();
                } else {
                    game.process();
                }

            };

            this.changeState = function() {

                if(state == 'menu') {

                    state = 'game';

                    if(menu.mesh) {

                        menu.mesh.visible = false;

                    };

                    if(game.carMesh) {

                        game.carMesh.visible = true;

                    };

                } else {

                    state = 'menu';

                    if(menu.mesh) {

                        menu.mesh.visible = true;

                    };

                    if(game.carMesh) {

                        game.carMesh.visible = false;

                    };

                    camera.position.set(0, 0, 10);
                    camera.lookAt( new THREE.Vector3() );

                };

                return state;

            };

            this.info = function() {

                return [
                    'META',
                    ['state', state]
                ];

            };

        })();

        return meta;

    }
);

        