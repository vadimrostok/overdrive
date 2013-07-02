define([], 
    function() {

        var transmission = {

            //Количество оборотов в минуту.
            rpm: 0,
            //Момент силы (вращения).
            torq: 0,
            //Коэффициент передаци главной пары.
            topGear: 3.7,
            efficiency: 0.9,

            currentGear: 0,

            gears: {
                '0': 0,
                '1': 2.8,
                '2': 2,
                '3': 1.1,
                '4': 0.9,
                '5': 0.74,
                'R': -2.9
            },

            gearUp: function() {

                if(this.currentGear != 'R' && this.gears[this.currentGear + 1] !== undefined) {

                    this.currentGear++;

                } else if(this.currentGear == 'R') {

                    this.currentGear = 0;

                };

                return this.currentGear;

            },

            gearDown: function() {

                if(this.currentGear != 'R' && this.gears[this.currentGear - 1] !== undefined) {

                    this.currentGear--;

                } else if(this.currentGear == 0) {

                    this.currentGear = 'R';

                };

                return this.currentGear;

            },

            setGear: function(g) {

                if(this.gears[g] !== undefined) {

                    this.currentGear = g;

                };

            },

            process: function(engine_torq, engine_rpm) {

                this.torq = engine_torq * this.efficiency * this.topGear * this.gears[this.currentGear];
                this.rpm = (this.currentGear != 0)? engine_torq * engine_rpm / this.torq: 0;

            },

            info: function() {

                return [

                    ['TRANSMISSION',    'green'],
                    ['RPM',             this.rpm],
                    ['Torque',          this.torq],
                    ['Current gear',    this.currentGear]

                ];

            }
            
        };

        return transmission;

    }
);