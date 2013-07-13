define([], 
    function() {

        var getTorque = function(rpm) {

            //torque-rpm-dependence
            var trd = {
                //От 1000 до 2000 rpm. Далее аналогично.
                '1': 200,
                '2': 250,
                '3': 270,
                '4': 280,
                '5': 230,
                '6': 200,
                'maxRpm': 6
            };

            var index = Math.floor(rpm / 1000),
                t = 0;

            if(!trd[index]) {

                return trd[1];

            } else if(trd[index + 1]) {

                var interpolation = (trd[index + 1] - trd[index]) * ((rpm % 1000)/1000);
                t = trd[index] + interpolation;

            } else {

                t = trd[index];

            }

            return t;

        };

        var engine = {

            //Количество оборотов в минуту.
            rpm: 1000,
            //Момент силы (вращения).
            torq: 0,
            minRpm: 1000,
            maxRpm: 6000,
            //Ускорение за секунду без учета сцепления.
            rpm_step: 4500,
            //Торможение закрытой дроссельной заслонке.
            rpm_backward_step: 3000,

            process: function(throttle, clutch) {

                if(this.rpm < this.minRpm) {

                    this.rpm = this.minRpm;

                } else if(this.rpm > this.maxRpm) {

                    this.rpm = this.maxRpm;

                };

                if(this.rpm > this.maxRpm * throttle) {

                    this.rpm -= this.rpm_backward_step * (1 - clutch) * delta;
                    this.torq = getTorque(this.rpm);

                } else if(this.rpm < this.maxRpm * throttle) {

                    this.rpm += this.rpm_step * (1 - clutch) * delta;
                    this.torq = getTorque(this.rpm);

                };

            },

            info: function() {

                return [

                    ['ENGINE',  'red'],
                    ['RPM',     this.rpm],
                    ['Torque',  this.torq]

                ];

            }

        };

        return engine;

    }
);