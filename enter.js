requirejs.config({
    paths: {
        jquery: 'libs/jquery',
        underscore: 'libs/underscore',
        backbone: 'libs/backbone',
        bootstrap: 'libs/bootstrap/js/bootstrap.min',
        jqueryui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min',

        //three: '../t/build/three',
        three: 'libs/three.min',
        stats: 'libs/stats.min',

        font: 'data/fonts/helvetiker_bold.typeface',
        //carMesh: 'libs/require/text!data/models/DodgeChallenger1970',

        base: 'app/base',
        meta: 'app/meta',
        menu: 'app/menu',
        game: 'app/game',

        engine: 'app/carPhysics/engine',
        transmission: 'app/carPhysics/transmission',
        chassis: 'app/carPhysics/chassis',
        steering: 'app/carPhysics/steering',
        navi: 'app/carPhysics/navi',
        view: 'app/carPhysics/view',
        suspesionKinematics: 'app/carPhysics/suspesionKinematics'
    },
    shim: {
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery']
        },
        jqueryui: {
            deps: ['jquery']
        },
        underscore: {
            exports: '_'
        },

        three: {
            exports: 'THREE'
        },
        stats: {
            exports: 'Stats'
        }
    }
});

require([
        'base'
    ],
    function(start) {

        start();

    }
);