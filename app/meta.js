define([
        'game',
        'menu'
    ], 
    function(game, menu) {

        var meta = new (function() {

            //menu || game
            var state = 'game';

            document.addEventListener('mousemove', function(e) {

                if(state == 'menu') {

                    menu.mouse('move', e);

                } else {

                    game.mouse('move', e);

                };

            });

            document.addEventListener('click', function(e) {

                if(state == 'menu') {

                    menu.mouse('click', e);

                } else {

                    game.mouse('click', e);

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

                } else {

                    state = 'menu';

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

        