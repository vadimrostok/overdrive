define([], 
    function() {

        var steering = {

            turnAngle: 0,
            turnRatio: 0,
            //Скорость поворота руля (градусов в секунду).
            degsPerSec: 50,
            //Скорость возвращения руля.
            backDegsPerSec: 60,
            //Максимальный угол поворота колес. На больших скоростях 
            //немного уменьшается, типа электронная защита.
            maxTurnAngle: 30,

            turn: function(carsTurners, carsRotation, longForceDirection, turnDirection, interaxalDistance, speed, suspesionKinematicsZRotation, mesh) {

                carsTurners.R.quaternion = quaternion([0, 1, 0], Math.PI / 180 * this.turnAngle);
                carsTurners.L.quaternion = quaternion([0, 1, 0], Math.PI / 180 * this.turnAngle);

                this.turnRatio = interaxalDistance / Math.sin(Math.PI / 180 * this.turnAngle);
                
                var deltaYAngle = delta * speed / this.turnRatio;

                carsRotation.multiply((new THREE.Matrix4()).makeRotationY(deltaYAngle));
                carsRotation.yAngle += deltaYAngle;

                longForceDirection.x = Math.sin(carsRotation.yAngle);
                longForceDirection.z = Math.cos(carsRotation.yAngle);

                turnDirection.x = Math.sin(carsRotation.yAngle + Math.PI / 180 * this.turnAngle);
                turnDirection.z = Math.cos(carsRotation.yAngle + Math.PI / 180 * this.turnAngle);

                var carsRotationClone = carsRotation.clone();
                carsRotationClone.multiply((new THREE.Matrix4()).makeRotationZ(suspesionKinematicsZRotation));

                mesh.rotation.setEulerFromRotationMatrix(carsRotationClone);

            },

            //Колеса вернуться в "состояние покоя", "смотреть" вперед.
            alignTurn: function() {

                if(this.turnAngle != 0) {

                    if(Math.abs(this.turnAngle) < 2) {

                        this.backDegsPerSec /= 10;

                    }

                    this.turnAngle = (this.turnAngle > 0)? this.turnAngle - this.backDegsPerSec * delta: this.turnAngle + this.backDegsPerSec * delta;

                    this.turnAngle = (Math.abs(this.turnAngle) < 0.1)? 0: this.turnAngle;

                }
            },

            setMaxTurnAngle: function(speed) {

                if(speed > 20) {

                    if(speed > 33) {

                        if(this.maxTurnAngle != 10) {

                            this.maxTurnAngle = 10;

                        };

                    } else if(this.maxTurnAngle != 20) {

                        this.maxTurnAngle = 20;

                    };
                    
                } else if(this.maxTurnAngle != 30) {

                    this.maxTurnAngle = 30;

                };

            },

            process: function(carsTurners, carsRotation, longForceDirection, turnDirection, interaxalDistance, speed, suspesionKinematicsZRotation, mesh) {

                if(keys.info('left', true)) {

                    if(this.turnAngle < this.maxTurnAngle) {

                        this.turnAngle += this.degsPerSec * delta;

                    } else if(this.turnAngle > this.maxTurnAngle + 3) {

                        this.alignTurn();

                    };

                } else if(keys.info('right', true)) {

                    if(this.turnAngle > -this.maxTurnAngle) {

                        this.turnAngle -= this.degsPerSec * delta;

                    } else if(this.turnAngle < -this.maxTurnAngle - 3) {

                        this.alignTurn();

                    };

                } else {

                    this.alignTurn();

                };

                this.backDegsPerSec = 60;

                this.turn(carsTurners, carsRotation, longForceDirection, turnDirection, interaxalDistance, speed, suspesionKinematicsZRotation, mesh);

            },

            info: function() {

                return [

                    ['STEERING',        'green'],
                    ['Turn Angle',      this.turnAngle],
                    ['Max Turn Angle',  this.maxTurnAngle]

                ];

            }
        };


        return steering;

    }
);