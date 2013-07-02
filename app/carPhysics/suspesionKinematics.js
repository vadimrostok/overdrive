define([], 
    function() {

        var suspesionKinematics = {

            //Наклон вдоль авто (перед - зад).
            longTurnAngle: 0,
            //Наклон поперек авто (лево - право).
            widthTurnAngle: 0,
            //Угол вращения вокруг продольной оси авто (перед - зад).
            zRotation: 0,

            process: function(carBodyBone, turnAngle, speed, acceleration) {

                this.processLong(carBodyBone, acceleration);
                this.processWidth(carBodyBone, speed, turnAngle);

            },

            processLong: function(carBodyBone, acceleration) {

                var angle = (acceleration)? acceleration / 10 * 4: 0;
                this.longTurnAngle += (angle - this.longTurnAngle) * 3 * delta; 
                carBodyBone.quaternion = quaternion([1, 0, 0],  -Math.PI / 180 * this.longTurnAngle);

            },

            processWidth: function(carBodyBone, speed, turnAngle) {

                if(speed < 20) {

                    this.widthTurnAngle = -turnAngle / 3 * (speed / 20);
                    this.zRotation = 0;

                } else {

                    this.widthTurnAngle = -turnAngle / 3;
                    this.zRotation = (speed / 20 - 1) * turnAngle / 100;

                };

                carBodyBone.quaternion.multiply(quaternion([0, 0, 1],  -Math.PI / 180 * this.widthTurnAngle));

            },

            info: function() {

                return [

                    ['SUSPENSION KINEMATICS',   'blue'],
                    ['Long Turn Angle',         this.longTurnAngle],
                    ['Width Turn Angle',        this.widthTurnAngle],
                    ['Z Rotation',              this.zRotation]

                ];

            }

        };

        return suspesionKinematics;

    }
);