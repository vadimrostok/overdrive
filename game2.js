define([
        'three'
    ], 
    function(THREE) {

        var mesh;

        var carConsts = {};

        //Радиус колес.
        carConsts.wheelRatio = 0.47410;
        //Амплитада движения амортизаторов.
        carConsts.absorbersAmplitude = 0.1668;
        //CoM == Center of Mass.
        //Высота центра масс.
        carConsts.comHeight = 0.481;
        //Расстояние от ЦМ до передней оси.
        carConsts.comToFDistance = 1.16744;
        //Расстояние от ЦМ до задней оси.
        carConsts.comToBDistance = 2.25251;
        //Расстояние от передней оси до передней оси.
        carConsts.interaxalDistance = carConsts.FToBDistance = 3,41995;

        /*
        Все коммуникации между объектами-составнаыми частями автомобиля должны проходить в car base . process
        Все ради читаты :3
        */

        var keysModel = function() {
            var pressComplete = function(code) {
                keysBuffer[code].isEven = (++keysBuffer[code].pressedCount % 2 == 0);
            };
            var keysBuffer = {};
            var checkKeyObjectExistence = function(code) {
                if(!keysBuffer[code]) {
                    keysBuffer[code] = {
                        pressedCount: 0,
                        isEven: true,
                        isPressed: false
                    }
                }
            };
            var onKeys = {};
            this.down = function(e) {
                checkKeyObjectExistence(e.keyCode);
                keysBuffer[e.keyCode].isPressed = true;
            };
            this.up = function(e) {
                checkKeyObjectExistence(e.keyCode);
                pressComplete(e.keyCode);
                keysBuffer[e.keyCode].isPressed = false;
                if(onKeys[e.keyCode]) {
                    onKeys[e.keyCode](e);
                }
            };
            this.info = function(key, onlyIsPressed) {
                var obj;
                switch(key) {
                    case 'up':      obj = keysBuffer[38]; break;
                    case 'down':    obj = keysBuffer[40]; break;
                    case 'left':    obj = keysBuffer[37]; break;
                    case 'right':   obj = keysBuffer[39]; break;
                    case 'esc':     obj = keysBuffer[27]; break;
                    case 'shift':   obj = keysBuffer[16]; break;
                    case 'ctrl':    obj = keysBuffer[17]; break;
                    default:        obj = (typeof key == 'string')? keysBuffer[key.charCodeAt()]: keysBuffer[key.charCodeAt()] || false;
                }
                return (obj && onlyIsPressed)? obj.isPressed: obj;
            };
            this.on = function(key, f) {
                onKeys[key] = f;
            }
        }, keys = new keysModel();

        document.addEventListener('keydown', keys.down, true);
        document.addEventListener('keyup', keys.up, true);

        var info = function() {
            var html = '';
            for(var i = 0; i < arguments.length; i++) {
                html += '<div style="float: left; margin: 10px; width: 200px;">';
                for(var j = 0; j < arguments[i].length; j++) {
                    html += arguments[i][j] + '<br/>';
                }
                html += '</div>';
            }
            document.getElementById('info').innerHTML += html;
        };

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
            rpm: 1000,
            torq: 0,
            minRpm: 1000,
            maxRpm: 6000,
            rpm_step: 3500,
            rpm_backward_step: 1000,
            process: function(throttle, clutch) {
                if(this.rpm < this.minRpm) {
                    this.rpm = this.minRpm;
                } else if(this.rpm > this.maxRpm) {
                    this.rpm = this.maxRpm;
                }

                if(this.rpm > this.maxRpm * throttle) {
                    this.rpm -= this.rpm_backward_step * (1 - clutch) * delta;
                    this.torq = getTorque(this.rpm);
                } else if(this.rpm < this.maxRpm * throttle) {
                    this.rpm += this.rpm_step * (1 - clutch) * delta;
                    this.torq = getTorque(this.rpm);
                }
            },
            info: function() {
                return '<div class="red">' + 
                    'ENGINE' + '<br/>' +  
                    'rpm = ' + this.rpm + '<br/>' +
                    'torq = ' + this.torq + '<br/>' +
                    '</div><br/>';
            }
        };

        var transmission = {
            gearUp: function() {
                if(this.currentGear != 'R' && this.gears[this.currentGear + 1] !== undefined) {
                    this.currentGear++;
                } else if(this.currentGear == 'R') {
                    this.currentGear = 0;
                }
                return this.currentGear;
            },
            gearDown: function() {
                if(this.currentGear != 'R' && this.gears[this.currentGear - 1] !== undefined) {
                    this.currentGear--;
                } else if(this.currentGear == 0) {
                    this.currentGear = 'R';
                }
                return this.currentGear;
            },
            setGear: function(g) {
                if(this.gears[g] !== undefined) {
                    this.currentGear = g;
                };
            },
            run: function(engineTorq, engineRpm) {
                this.currentGear = currentGear;
                return progress(engineTorq, engineRpm);
            },
            gears: {
                '0': 0,
                '1': 2.8,
                '2': 2,
                '3': 1.1,
                '4': 0.9,
                '5': 0.74,
                'R': -2.9
            },
            currentGear: 0,
            topGear: 3.7,
            efficiency: 0.9,
            torq: 0,
            rpm: 0,
            process: function(torq, rpm) {
                this.torq = torq * this.efficiency * this.topGear * this.gears[this.currentGear];
                this.rpm = (this.currentGear != 0)? torq * rpm / this.torq: 0;
            },
            info: function() {
                return '<div class="green">' + 
                    'TRANSMISSION' + '<br/>' +
                    'torq = ' + this.torq + '<br/>' +
                    'rpm = ' + this.rpm + '<br/>' +
                    'currentGear = ' + this.currentGear + '<br/>' +
                    '</div><br/>';
            }
        };

        var chassis = {
            wheelRatio: 0.47,
            speedLimit: 0,
            rpm: 0,
            rpmNeutral: 20,
            rpmBraking: 150,
            speed: 0,
            acceleration: 0,
            rpmMaxAcceleration: {
                '1': 200,
                '2': 70,
                '3': 50,
                '4': 40,
                '5': 30,
                'R': 100
            },
            process: function(torq, rpm_transmission, brakes) {
                this.speedLimit = rpm_transmission / 60 * 2 * Math.PI * this.wheelRatio;
                if(this.speed < 0) {
                    if(this.rpm > rpm_transmission) {
                        var rpmAcceleration = (rpm_transmission - this.rpm) * transmission.gears[transmission.currentGear];
                        rpmAcceleration = (rpmAcceleration > this.rpmMaxAcceleration[transmission.currentGear])? this.rpmMaxAcceleration[transmission.currentGear]: rpmAcceleration;
                        this.rpm += -rpmAcceleration * delta;
                    } else if(this.rpm < rpm_transmission + 5) {
                        this.rpm += this.rpmNeutral * delta;
                    } else {
                        this.rpm = rpm_transmission;
                    }
                } else {
                    if(this.rpm < rpm_transmission) {
                        var rpmAcceleration = (rpm_transmission - this.rpm) * 10 * navi.throttle;// * transmission.gears[transmission.currentGear];
                        rpmAcceleration = (rpmAcceleration > this.rpmMaxAcceleration[transmission.currentGear])? this.rpmMaxAcceleration[transmission.currentGear]: rpmAcceleration;
                        this.rpm += rpmAcceleration * delta;
                    } else if(this.rpm > rpm_transmission + 5) {
                        this.rpm -= this.rpmNeutral * delta;
                    } else {
                        this.rpm = rpm_transmission;
                    }
                };        
                if(brakes > 0) {
                    if(this.rpm > -5 && this.rpm < 5) {
                        this.rpm = 0;
                    }
                    if(this.speed < 0) {
                        if(this.rpm < -5) {
                            this.rpm += this.rpmBraking * delta * brakes;
                        };
                    } else {
                        if(this.rpm > 5) {
                            this.rpm -= this.rpmBraking * delta * brakes;
                        };
                    };
                }
                this.acceleration = (this.getCurrentSpeed() - this.speed)/delta;
                this.speed = this.getCurrentSpeed();
                /*if(this.speed > 0 && !window.time) {
                    window.time = new Date();
                }
                if(this.speed * 3.6 > 100) {
                    var d = new Date();
                    throw (d.getTime() - window.time.getTime())/1000;
                }*/
                this.rotateWheels();
            },
            getCurrentSpeed: function() {
                //Meters per second.
                return this.rpm / 60 * 2 * Math.PI * this.wheelRatio;
            },
            rotateWheels: function() {
                var tmp = this.rpm / 60 * delta * 2 * Math.PI;
                for(var i = 0; i < 4; i++) {
                    car.bones.wheels[i].quaternion.multiply(quaternion([1, 0, 0], tmp));
                }
            },
            inertionForce: function(f) {
                this.rpm -= this.rpm * f * delta;
            },
            info: function() {
                return '<div class="blue">' + 
                    'CHASSIS' + '<br/>' +  
                    'speedLimit = ' + this.speedLimit + '<br/>' +
                    'speed = ' + this.speed + '<br/>' +
                    'acceleration = ' + this.acceleration + '<br/>' +
                    'rpm = ' + this.rpm + '<br/>' +
                    '</div><br/>';
            }
        };

        var navi = {
            throttle: 0,
            clutch: 0,
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
                }

                if(keys.info('L', true)) {
                    view.userTurnAroundAngle += steering.maxTurnAngle * delta;
                } else if(keys.info('R', true)) {
                    view.userTurnAroundAngle += steering.maxTurnAngle * delta;
                }
            },
            info: function() {
                return '<div class="blue">' + 
                    'NAVI' + '<br/>' +  
                    'throttle = ' + this.throttle + '<br/>' +
                    'clutch = ' + this.clutch + '<br/>' +
                    'clutch = ' + this.brakes + '<br/>' +
                    '</div><br/>';
            }
        };

        var suspesionKinematics = {
            longTurnAngle: 0,
            widthTurnAngle: 0,
            zRotation: 0,
            process: function() {
                this.processLong();
                this.processWidth();
            },
            processLong: function() {
                var angle = (chassis.acceleration)? chassis.acceleration / 10 * 4: 0;
                this.longTurnAngle += (angle - this.longTurnAngle) * 3 * delta; 
                car.bones.car.quaternion = quaternion([1, 0, 0],  -Math.PI / 180 * this.longTurnAngle);
            },
            processWidth: function() {
                if(chassis.speed < 20) {
                    this.widthTurnAngle = -steering.turnAngle / 3 * (chassis.speed / 20);
                    this.zRotation = 0;
                } else {
                    this.widthTurnAngle = -steering.turnAngle / 3;
                    this.zRotation = (chassis.speed / 20 - 1) * steering.turnAngle / 100;
                }
                car.bones.car.quaternion.multiply(quaternion([0, 0, 1],  -Math.PI / 180 * this.widthTurnAngle));
            },
            info: function() {
                return '<div class="blue">' + 
                    'SUSPENSION KINEMATICS' + '<br/>' +  
                    'longTurnAngle = ' + this.longTurnAngle + '<br/>' +
                    'widthTurnAngle = ' + this.widthTurnAngle + '<br/>' +
                    'zRotation = ' + this.zRotation + '<br/>' +
                    '</div><br/>';
            }
        };

        var bodyKinematics = {
            yRotation: 0,
            torque: 0,
            process: function() {
                var inertia = 0.5 * car.weight * carConsts.interaxalDistance / 2;
                this.torque = inertia * (steering.turnAngle * chassis.speed / 2000);
                this.yRotation = this.torque * delta;
            },
            info: function() {
                return '<div class="blue">' + 
                    'BODY KINEMATICS' + '<br/>' +  
                    'torque = ' + this.torque + '<br/>' +
                    'yRotation = ' + this.yRotation + '<br/>' +
                    '</div><br/>';
            }
        };

        var view = {
            position: new THREE.Vector3(0, 1, -3),
            distance: 7,
            angle: Math.PI,
            localAngle: 0,
            userTurnAroundAngle: 0,
            process: function() {
                var tmp = car.position.clone();

                this.angle += (steering.turnRatio != 0)? delta * chassis.speed / steering.turnRatio: 0;

                //Косинусодное "сглаживание".
                var k = Math.cos((1 - Math.abs(steering.turnAngle) / 30) * Math.PI + Math.PI) / 2 - 0.5;

                this.localAngle = steering.turnAngle * k;

                var resultAngle = this.angle + Math.PI / 180 * this.localAngle + Math.PI / 180 * this.userTurnAroundAngle;

                camera.position.x = tmp.x + this.distance * Math.sin( resultAngle );
                camera.position.y = tmp.y + 5;
                camera.position.z = tmp.z  + this.distance * Math.cos( resultAngle );

                camera.lookAt(tmp.clone().setY(tmp.y + 2.5));
            },
            info: function() {
                return '<div class="green">' + 
                    'VIEW' + '<br/>' +  
                    'angle = ' + this.angle + '<br/>' +
                    'localAngle = ' + this.localAngle + '<br/>' +
                    '</div><br/>';
            }
        };

        var steering = {
            turnAngle: 0,
            turnRatio: 0,
            degsPerSec: 50,
            backDegsPerSec: 60,
            maxTurnAngle: 30,
            turn: function() {
                car.bones.turners.R.quaternion = quaternion([0, 1, 0], Math.PI / 180 * this.turnAngle);
                car.bones.turners.L.quaternion = quaternion([0, 1, 0], Math.PI / 180 * this.turnAngle);

                this.turnRatio = carConsts.interaxalDistance / Math.sin(Math.PI / 180 * this.turnAngle);
                var deltaYAngle = delta * chassis.speed / this.turnRatio;
                car.rotation.multiply((new THREE.Matrix4()).makeRotationY(deltaYAngle));
                car.rotation.yAngle += deltaYAngle;

                car.N.x = Math.sin(car.rotation.yAngle);
                car.N.z = Math.cos(car.rotation.yAngle);

                car.P.x = Math.sin(car.rotation.yAngle + Math.PI / 180 * this.turnAngle);
                car.P.z = Math.cos(car.rotation.yAngle + Math.PI / 180 * this.turnAngle);

                var tmp = car.rotation.clone();
                tmp.multiply((new THREE.Matrix4()).makeRotationZ(suspesionKinematics.zRotation));

                mesh.rotation.setEulerFromRotationMatrix(tmp);
            },
            alignTurn: function() {
                if(this.turnAngle != 0) {
                    if(Math.abs(this.turnAngle) < 2) {
                        this.backDegsPerSec /= 10;
                    }
                    this.turnAngle = (this.turnAngle > 0)? this.turnAngle - this.backDegsPerSec * delta: this.turnAngle + this.backDegsPerSec * delta;
                    this.turnAngle = (Math.abs(this.turnAngle) < 0.1)? 0: this.turnAngle;
                }
            },
            process: function() {
                if(keys.info('left', true)) {
                    if(this.turnAngle < this.maxTurnAngle) {
                        this.turnAngle += this.degsPerSec * delta;
                    } else if(this.turnAngle > this.maxTurnAngle + 3) {
                        this.alignTurn();
                    }
                } else if(keys.info('right', true)) {
                    if(this.turnAngle > -this.maxTurnAngle) {
                        this.turnAngle -= this.degsPerSec * delta;
                    } else if(this.turnAngle < -this.maxTurnAngle - 3) {
                        this.alignTurn();
                    }
                } else {
                    this.alignTurn();
                }
                this.backDegsPerSec = 60;
                this.turn();
            },
            info: function() {
                return '<div class="green">' + 
                    'STEERING' + '<br/>' +  
                    'turnAngle = ' + this.turnAngle + '<br/>' +
                    'maxTurnAngle = ' + this.maxTurnAngle + '<br/>' +
                    '</div><br/>';
            }
        };

        var carModel = function(bones) {
            this.weight = 1100;
            this.rotation = new THREE.Matrix4();
            this.rotation.yAngle = 0;
            this.inertionYAngle = 0;
            this.position = new THREE.Vector3();
            //Вектор продольно силы тяги.
            this.N = new THREE.Vector3(0, 0, 1);
            //Вектор направления колес.
            this.P = new THREE.Vector3();
            //Вектор сил инерции.
            this.C = new THREE.Vector3();
            this.speedV = new THREE.Vector3();
            this.worldSpeed;
            this.NCDiffFactor = 10;
            this.CFactor = 0.02;
            this.scalarInertionSpeed = 0;

            this.process = function() {

                document.getElementById('info').innerHTML = '';

                navi.process();

                steering.process();

                engine.process(navi.throttle, navi.clutch);

                transmission.process(engine.torq, engine.rpm);

                chassis.process(transmission.torq, transmission.rpm, navi.brakes);

                if(chassis.speed > 20) {
                    if(chassis.speed > 33) {
                        if(steering.maxTurnAngle != 10) {
                            steering.maxTurnAngle = 10;
                        }
                    } else if(steering.maxTurnAngle != 20) {
                        steering.maxTurnAngle = 20;
                    }
                } else if(steering.maxTurnAngle != 30) {
                    steering.maxTurnAngle = 30;
                }

                suspesionKinematics.process();

                bodyKinematics.process();
                
                this.speedV.z = chassis.speed;

                //this.inertionYAngle += (chassis.speed > 0)? (this.rotation.yAngle - this.inertionYAngle) / 20 * 30 / chassis.speed: 0;
                if(chassis.speed > 1) {
                    this.inertionYAngle += (this.rotation.yAngle - this.inertionYAngle) / 20 * 30 / chassis.speed;    
                } else {
                    this.inertionYAngle = this.rotation.yAngle || 0;
                }
                ///this.inertionYAngle += (chassis.speed > 0)? (this.rotation.yAngle - this.inertionYAngle) / 20 * 30 * chassis.speed: 0;

                this.C.x = Math.sin(this.inertionYAngle);
                this.C.z = Math.cos(this.inertionYAngle);
                this.C.sub(this.N);

                this.scalarInertionSpeed = Math.pow(this.C.x * this.C.x + this.C.y * this.C.y + this.C.z * this.C.z, 1 / 3);

                chassis.inertionForce(this.scalarInertionSpeed);

                this.worldSpeed = this.speedV.clone().applyMatrix4(this.rotation).multiplyScalar(delta);

                this.worldSpeed.add(this.C.clone().multiplyScalar(chassis.speed * delta));

                //vec(this.position.clone(), this.position.clone().add(this.worldSpeed), 0x000000);
                //vec(this.position, this.position.clone().add(this.worldSpeed), 0x000000);

                this.position.add(this.worldSpeed);

                mesh.position.set(this.position.x, this.position.y, this.position.z);

                scene.remove(this.N.line);
                this.N.line = vec(this.position, this.position.clone().add(this.N.clone().multiplyScalar(10)), 0x0000ff);
                scene.remove(this.P.line);
                this.P.line = vec(this.position, this.position.clone().add(this.P.clone().multiplyScalar(10)), 0x00ff00);
                scene.remove(this.C.line);
                this.C.line = vec(this.position, this.position.clone().add(this.C.clone().multiplyScalar(10)), 0xff0000);

                view.process();

                mesh.translateZ(carConsts.interaxalDistance / 2);

                info([engine.info(), transmission.info(), chassis.info(), navi.info(), view.info(), suspesionKinematics.info(), bodyKinematics.info(), steering.info()], [this.info()]);
            };

            this.info = function() {
                return '<div class="red">' + 
                    'CAR BASE' + '<br/>' +  
                    'position = ' + '<br/>' +
                        this.position.x + '<br/>' +
                        this.position.y + '<br/>' +
                        this.position.z + '<br/>' +
                    'N = ' + '<br/>' +
                        this.N.x + '<br/>' +
                        this.N.y + '<br/>' +
                        this.N.z + '<br/>' +
                    'P = ' + '<br/>' +
                        this.P.x + '<br/>' +
                        this.P.y + '<br/>' +
                        this.P.z + '<br/>' +
                    'C = ' + '<br/>' +
                        this.C.x + '<br/>' +
                        this.C.y + '<br/>' +
                        this.C.z + '<br/>' +
                    'speed = ' + this.speedV.z + '<br/>' +
                    'worldSpeed = ' + '<br/>' +
                        this.worldSpeed.x + '<br/>' +
                        this.worldSpeed.y + '<br/>' +
                        this.worldSpeed.z + '<br/>' +
                    'yRotation = ' + this.rotation.yAngle + '<br/>' +
                    'inertionYAngle = ' + this.inertionYAngle + '<br/>' +
                    'scalarInertionSpeed = ' + this.scalarInertionSpeed + '<br/>' +
                    '</div><br/>';
            }

            var parseBones = function(bs) {
                var wheels = [], car, turners = {};
                for(var i = 0, l = bs.length; i < l; i++) {
                    if(bs[i].name.indexOf('Spin') >= 0) {
                        wheels.push(bs[i]);
                    } else if(bs[i].name.indexOf('Turn') >= 0) {
                        turners[bs[i].name.substr(-1)] = bs[i];
                    } else if(bs[i].name.indexOf('Car') >= 0) {
                        car = bs[i];
                    }
                }
                return {wheels: wheels, car: car, turners: turners};
            };

            this.bones = parseBones(bones);
        }, car;

        keys.on(107 /*+*/, function() {transmission.gearUp();});
        keys.on(109 /*-*/, function() {transmission.gearDown();});

        var game = new (function() {

            var inited = false;

            var loader = new THREE.JSONLoader(true);

            loader.load(
                'DodgeChallenger1970.js',
                function(geometry, materials) {

                    for(var i = 0; i < materials.length; i++) {

                        materials[i].skinning = true;

                    };

                    var material = new THREE.MeshFaceMaterial(materials);

                    mesh = new THREE.SkinnedMesh(geometry, material);

                    scene.add(mesh);

                    car = new carModel(mesh.bones, mesh);

                    inited = true;

                }
            );

            this.process = function() {

                if(inited) {

                    car.process();

                };

            };

            this.info = function() {

                return [

                    'GAME',
                    ['is inited?', inited]

                ];

            };

        })();

        return game;
    }
);