define([], 
    function() {

        var steering = {

            steeringAngle: 0,
            turnAngle: 0,
            turnRatio: 0,
            //Скорость поворота руля (градусов в секунду).
            degsPerSec: 100,
            //Скорость возвращения руля.
            backDegsPerSec: 60,

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

            smoothTurn: function(speed) {

                if(Math.abs(this.steeringAngle) > 10 && Math.abs(this.steeringAngle) > -speed + 30) {

                        if(-speed + 30 < 10) {

                            return (this.steeringAngle > 0)? 10: -10;

                        } else {

                            return (this.steeringAngle > 0)? -speed + 30: speed - 30;

                        };

                };

                return this.steeringAngle;

            },

            process: function(carsTurners, carsRotation, longForceDirection, turnDirection, interaxalDistance, speed, suspesionKinematicsZRotation, mesh) {

                var angle = this.smoothTurn(speed);

                if(angle > this.turnAngle) {

                    this.turnAngle += (angle - this.turnAngle)/10;

                } else {

                    this.turnAngle -= (this.turnAngle - angle)/10;

                };

                this.turn(carsTurners, carsRotation, longForceDirection, turnDirection, interaxalDistance, speed, suspesionKinematicsZRotation, mesh);

            },

            info: function() {

                return [

                    ['STEERING',        'green'],
                    ['Turn Angle',      this.turnAngle],
                    ['Steering Turn Angle',  this.steeringAngle]

                ];

            }
        };


        return steering;

    }
);