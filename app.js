requirejs.config({
    paths: {
        jquery: 'libs/jquery',
        underscore: 'libs/underscore',
        backbone: 'libs/backbone',
        bootstrap: 'libs/bootstrap/js/bootstrap.min',
        jqueryui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min',

        three: '../t/build/three',
        fontForThree: 'helvetiker_bold.typeface',
        stats: '../t/examples/js/libs/stats.min',

        base: 'base2',
        meta: 'meta',
        menu: 'menu',
        game: 'game2'
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