define([], 
    function() {

        var navi = {

            //Коэффициент открытия дроссельной заслонки. От 0 до 1. 
            throttle: 0,
            //Коэффициент сцепления. От 0 до 1. 
            clutch: 0,
            //Коэффициент торможения. От 0 до 1. 
            brakes: 0,

            process: function(gear) {

                this.clutch = (gear == '0')? 0.0: 0.8;

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