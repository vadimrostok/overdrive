define([], 
    function() {

        var view = {

            distance: 15,
            angle: Math.PI,
            localAngle: 0,
            userTurnAroundAngle: 0,

            process: function(carPosition, speed, turnAngle, turnRatio, throttle, brakes) {

                var carPosition = carPosition.clone();

                this.angle += (turnRatio != 0)? delta * speed / turnRatio: 0;

                //Косинусоидное "сглаживание".
                var k = Math.cos((1 - Math.abs(turnAngle) / 30) * Math.PI + Math.PI) / 2 - 0.5;

                this.localAngle = turnAngle * k;

                var resultAngle = this.angle + Math.PI / 180 * this.localAngle + Math.PI / 180 * this.userTurnAroundAngle;

                camera.position.x = carPosition.x + this.distance * Math.sin( resultAngle );
                camera.position.y = carPosition.y + 5;
                camera.position.z = carPosition.z  + this.distance * Math.cos( resultAngle );

                camera.lookAt(carPosition.clone().setY(carPosition.y + 2.5 + (throttle - brakes) * 5));

                return resultAngle;

            },

            info: function() {

                return [

                    ['VIEW',        'green'],
                    ['Angle',       this.angle],
                    ['Local Angle', this.localAngle]

                ];

            }

        };


        return view;

    }
);