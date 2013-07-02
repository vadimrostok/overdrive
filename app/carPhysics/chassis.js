define([], 
    function() {

        var chassis = {

            //Это значение пропорционально передаче, работает в качестве 
            //ограничителя, машина не может разгнаться больше него.
            speedLimit: 0,
            //Количество оборотов в минуту.
            rpm: 0,
            //Скорость падения оборотов при опущенной дроссельной заслонке.
            rpmNeutral: 35,
            //Коэффициент торможения. Скорость падения оборотов при при торможении по совместительству.
            rpmBraking: 250,
            speed: 0,
            acceleration: 0,

            //Ограничения ускорения (в оборотах в минуту); одно из состовляющих 
            //для (создания эффекта ~ моделирования) переключения передач.
            rpmMaxAcceleration: {
                '1': 200,
                '2': 70,
                '3': 50,
                '4': 40,
                '5': 30,
                'R': 100
            },

            process: function(rpm_transmission, brakes, carsWheels, wheelRatio, throttle, currentGear, gearFactor) {

                this.speedLimit = rpm_transmission / 60 * 2 * Math.PI * wheelRatio;

                //Едем назад?
                if(this.speed < 0) {

                    //И ускоряемся?
                    if(this.rpm > rpm_transmission) {

                        var rpmAcceleration = (rpm_transmission - this.rpm) * gearFactor;
                        rpmAcceleration = (rpmAcceleration > this.rpmMaxAcceleration[currentGear])? this.rpmMaxAcceleration[currentGear]: rpmAcceleration;
                        this.rpm += -rpmAcceleration * delta;

                    } else if(this.rpm < rpm_transmission + 5) {

                        //Даже если включена другая скорость (в другую сторону ускорение в 
                        //кпп) скорость сбрасываем с ускорением отпущенной педали газа, типа электронная защита.
                        this.rpm += this.rpmNeutral * delta;

                    } else {

                        this.rpm = rpm_transmission;

                    };

                } else {

                    if(this.rpm < rpm_transmission) {

                        var rpmAcceleration = (rpm_transmission - this.rpm) * 10 * throttle;
                        rpmAcceleration = (rpmAcceleration > this.rpmMaxAcceleration[currentGear])? this.rpmMaxAcceleration[currentGear]: rpmAcceleration;
                        this.rpm += rpmAcceleration * delta;

                    } else if(this.rpm > rpm_transmission + 5) {

                        this.rpm -= this.rpmNeutral * delta;

                    } else {

                        this.rpm = rpm_transmission;

                    };

                };

                if(brakes > 0) {

                    if(this.rpm > -5 && this.rpm < 5) {

                        this.rpm = 0;

                    };

                    if(this.speed < 0) {

                        if(this.rpm < -5) {

                            this.rpm += this.rpmBraking * delta * brakes;

                        };

                    } else {

                        if(this.rpm > 5) {

                            this.rpm -= this.rpmBraking * delta * brakes;

                        };

                    };

                };

                this.acceleration = (this.getCurrentSpeed(wheelRatio) - this.speed) / delta;

                this.speed = this.getCurrentSpeed(wheelRatio);

                this.rotateWheels(carsWheels);

            },

            getCurrentSpeed: function(wheelRatio) {

                //In meters per second.
                return this.rpm / 60 * 2 * Math.PI * wheelRatio;

            },

            rotateWheels: function(carsWheels) {

                var angle = this.rpm / 60 * delta * 2 * Math.PI;

                for(var i = 0; i < 4; i++) {

                    carsWheels[i].quaternion.multiply( quaternion([1, 0, 0], angle) );

                }

            },

            //Если машина едет на юг, а силы инерции (в следствии резкого поворота) зовут 
            //её на запад? Боковая сила тормозит авто.
            inertionForce: function(f) {

                this.rpm -= this.rpm * f * delta;

            },

            info: function() {

                return [

                    ['CHASSIS',         'blue'],
                    ['Speed',           this.speed],
                    ['Speed limit',     this.speedLimit],
                    ['Acceleration',    this.acceleration]

                ];

            }

        };

        return chassis;

    }
);