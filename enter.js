requirejs.config({
    paths: {
        three: 'libs/three.min',
        stats: 'libs/stats.min',

        font: 'data/fonts/helvetiker_bold.typeface',

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

window.app = {};
app.data = {};