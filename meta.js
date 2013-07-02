define([
        'game',
        'menu'
    ], 
    function(game, menu) {

        var meta = new (function() {

            //menu || game
            var state = 'game';

            this.process = function() {

                if(state == 'menu') {
                    menu.process();
                } else {
                    game.process();
                }

            };

            this.changeState = function() {

                state = (state == 'menu')? 'game': 'menu';
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

        