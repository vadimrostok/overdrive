define([], 
    function() {

        var navi = {

            //Коэффициент открытия дроссельной заслонки. От 0 до 1. 
            throttle: 0,
            //Коэффициент сцепления. От 0 до 1. 
            clutch: 0,
            //Коэффициент торможения. От 0 до 1. 
            brakes: 0,

            process: function() {

                if(keys.info('up', true)) {

                    this.throttle = 0.8;
                    this.clutch = 0.8;
                    this.brakes = 0.0;

                } else if(keys.info('down', true)) {

                    this.throttle = 0.2;
                    this.clutch = 0.0;
                    this.brakes = 1.0;

                } else {

                    this.throttle = 0.1;
                    this.clutch = 0.8;
                    this.brakes = 0.0;

                };

                //!!!
                if(keys.info('L', true)) {

                    view.userTurnAroundAngle += steering.maxTurnAngle * delta;

                } else if(keys.info('R', true)) {

                    view.userTurnAroundAngle += steering.maxTurnAngle * delta;

                }

            },

            info: function() {

                return [

                    ['NAVI',        'blue'],
                    ['Throttle',    this.throttle],
                    ['Clutch',      this.clutch],
                    ['Brakes',      this.brakes]

                ];

            }
            
        };

        return navi;

    }
);