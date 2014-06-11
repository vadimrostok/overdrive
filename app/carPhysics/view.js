define([],
    function() {

        var view = {

            distance: 7,
            angle: Math.PI,
            localAngle: 0,
            userTurnAroundAngle: 0,

            process: function(carPosition, speed, turnAngle, turnRatio, throttle, brakes) {

                var carPosition = carPosition.clone();

                this.angle += (turnRatio != 0)? delta * speed / turnRatio: 0;

                //Косинусоидное "сглаживание".
                //var k = Math.cos((1 - Math.abs(turnAngle)/30) * Math.PI + Math.PI) - 0.5;
                var k = -Math.sin(Math.abs(turnAngle)/30*Math.PI/2 + Math.PI/4)*2;

                this.localAngle = turnAngle * k * 1;

                var resultAngle = this.angle + Math.PI / 180 * this.localAngle + Math.PI / 180 * this.userTurnAroundAngle;

                camera.position.x = carPosition.x + this.distance * Math.sin( resultAngle );
                camera.position.y = carPosition.y + 5 - 2*(throttle - brakes);
                camera.position.z = carPosition.z  + this.distance * Math.cos( resultAngle );

                camera.lookAt(carPosition.clone().setY(carPosition.y + 1 + (throttle - brakes)));

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
