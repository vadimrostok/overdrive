define([
        'three',
        'engine',
        'transmission',
        'chassis',
        'steering',
        'navi',
        'view',
        'suspesionKinematics'
    ], 
    function(THREE, engine, transmission, chassis, steering, navi, view, suspesionKinematics) {

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
        carConsts.interaxalDistance = carConsts.FToBDistance = 3.41995;

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
            this.scalarInertionSpeed = 0;

            this.process = function() {

                navi.process();

                steering.process(car.bones.turners, car.rotation, car.N, car.P, carConsts.interaxalDistance, chassis.speed, suspesionKinematics.zRotation, mesh);

                engine.process(navi.throttle, navi.clutch);

                transmission.process(engine.torq, engine.rpm);

                if(transmission.engineBrake > 0) {

                    engine.rpm -= transmission.engineBrake;
                    
                    if(engine.rpm < engine.minRpm) {

                        engine.rpm = engine.minRpm;

                    };

                    transmission.engineBrake = 0;

                }

                chassis.process(transmission.rpm, navi.brakes, car.bones.wheels, carConsts.wheelRatio, navi.throttle, transmission.currentGear, transmission.gears[transmission.currentGear]);

                suspesionKinematics.process(car.bones.car, steering.turnAngle, chassis.speed, chassis.acceleration);

                this.calculateForceVectors();

                chassis.inertionForce(this.scalarInertionSpeed);

                this.calculateNewPosition();

                var angle = view.process(car.position, chassis.speed, steering.turnAngle, steering.turnRatio, navi.throttle, navi.brakes);

                mesh.translateZ(carConsts.interaxalDistance / 2);

                this.updateDashboard(angle);

                this.computeLightsPosition();

                //info(engine.info(), transmission.info(), chassis.info(), navi.info(), view.info(), suspesionKinematics.info(), steering.info(), this.info());

            };

            this.calculateForceVectors = function() {

                if(chassis.speed > 1) {

                    this.inertionYAngle += (this.rotation.yAngle - this.inertionYAngle) / 20 * 30 / chassis.speed;

                } else {

                    this.inertionYAngle = this.rotation.yAngle || 0;

                };

                this.C.x = Math.sin(this.inertionYAngle);
                this.C.z = Math.cos(this.inertionYAngle);
                this.C.sub(this.N);

                this.scalarInertionSpeed = Math.pow(this.C.x * this.C.x + this.C.y * this.C.y + this.C.z * this.C.z, 1 / 3);

            };

            this.calculateNewPosition = function() {

                this.speedV.z = chassis.speed;

                this.worldSpeed = this.speedV.clone().applyMatrix4(this.rotation).multiplyScalar(delta);

                this.worldSpeed.add(this.C.clone().multiplyScalar(chassis.speed * delta));

                this.position.add(this.worldSpeed);

                mesh.position.set(this.position.x, this.position.y, this.position.z);

            };

            this.drawForceVectors = function() {

                scene.remove(this.N.line);
                this.N.line = vec(this.position, this.position.clone().add(this.N.clone().multiplyScalar(10)), 0x0000ff);

                scene.remove(this.P.line);
                this.P.line = vec(this.position, this.position.clone().add(this.P.clone().multiplyScalar(10)), 0x00ff00);

                scene.remove(this.C.line);
                this.C.line = vec(this.position, this.position.clone().add(this.C.clone().multiplyScalar(10)), 0xff0000);

            };

            this.operate = function(acceleration, turnabout) {

                //
                acceleration = 2 * acceleration / window.innerHeight - 1;
                turnabout = 2 * turnabout / window.innerWidth - 1;

                turnabout *= -Math.cos((1 - Math.abs(turnabout)) * Math.PI + Math.PI) / 2 + 0.5;

                navi.throttle = (acceleration < 0)? -acceleration: 0;
                navi.brakes = (acceleration > 0)? acceleration: 0;
                
                steering.steeringAngle = -turnabout * 30;

            };

            this.dashboard = {
                meterScale: null,
                speedmeter: null,
                rpmScale: null,
                rpm: null
            };

            this.initDashboard = function() {

                var that = this;

                loader.load(
                    'data/models/arrow.js',
                    function(geometry, materials) {

                        var material;// = new THREE.MeshFaceMaterial(materials);

                        material = new THREE.MeshBasicMaterial({ color: 0xff0055 });

                        that.dashboard.speedmeter = new THREE.Mesh(geometry, material);

                        that.dashboard.speedmeter.scale.set(0.03, 0.03, 0.03);

                        scene.add(that.dashboard.speedmeter);

                        window.s = that.dashboard.speedmeter;

                        material = new THREE.MeshBasicMaterial({ color: 0x0099ff });

                        that.dashboard.rpm = new THREE.Mesh(geometry, material);

                        that.dashboard.rpm.scale.set(0.03, 0.03, 0.03);

                        scene.add(that.dashboard.rpm);

                    }
                );

                loader.load(
                    'data/models/meter.js',
                    function(geometry, materials) {

                        var material;// = new THREE.MeshFaceMaterial(materials);
                        material = new THREE.MeshBasicMaterial({ color: 0xaa99ff });

                        that.dashboard.meterScale = new THREE.Mesh(geometry, material);

                        that.dashboard.meterScale.scale.set(0.225,0.225,0.225);

                        window.m = that.dashboard.meterScale;

                        scene.add(that.dashboard.meterScale);

                        material = new THREE.MeshBasicMaterial({ color: 0xff5533 });

                        that.dashboard.rpmScale = new THREE.Mesh(geometry, material);

                        that.dashboard.rpmScale.scale.set(0.225,0.225,0.225);

                        scene.add(that.dashboard.rpmScale);

                    }
                );

            };

            var myz = 0;

            this.updateDashboard = function(angle) {

                if(!this.dashboard.speedmeter || !this.dashboard.meterScale) {

                    return false;

                };

                var tmpPosition = camera.position.clone();

                tmpPosition.x += 2 * Math.sin( Math.PI + angle );
                tmpPosition.z += 2 * Math.cos( Math.PI + angle );

                //Eденичный вектор, проходящий от камеры до авто. Изображает направление камеры.
                var cameraLook = camera.position.clone()
                    .sub(car.position.clone().setY(camera.position.y));
                cameraLook.normalize();

                //Вектор, характеризующий поворот вокруг Y плоскости,
                //вдоль которого будут располагаться приборы.
                var dashboardHorizone = cameraLook.clone()
                    .transformDirection(new THREE.Matrix4().makeRotationY(-Math.PI / 180 * 90));


                this.dashboard.speedmeter.position = tmpPosition.clone();
                this.dashboard.speedmeter.rotation = camera.rotation.clone();

                //Перемещаем вдоль вектора влево-вправо.
                this.dashboard.speedmeter.position.add(dashboardHorizone.clone().multiplyScalar(0.5));

                //Коипруем поворот тут, т.к. потом он изменитяся у стрелки в зависимости от скорости.
                this.dashboard.meterScale.position = this.dashboard.speedmeter.position.clone();
                this.dashboard.meterScale.rotation = this.dashboard.speedmeter.rotation.clone();
                this.dashboard.meterScale.position.y = this.dashboard.speedmeter.position.y = 4 + (navi.throttle - navi.brakes) * 5 * (2 / 13);

                this.dashboard.speedmeter.rotation.z -= Math.PI / 180 * chassis.speed;

                this.dashboard.rpm.position = tmpPosition.clone();
                this.dashboard.rpm.rotation = camera.rotation.clone();

                this.dashboard.rpm.position.add(dashboardHorizone.clone().multiplyScalar(-0.5));

                this.dashboard.rpmScale.position = this.dashboard.rpm.position.clone();
                this.dashboard.rpmScale.rotation = camera.rotation.clone();
                this.dashboard.rpmScale.position.y = this.dashboard.rpm.position.y = 4 + (navi.throttle - navi.brakes) * 5 * (2 / 13);

                this.dashboard.rpm.rotation.z -= Math.PI / 180 * engine.rpm / 50;

            };

            this.computeLightsPosition = function() {

                var carPosition = this.position;

                lights.directional.position.set(
                    lights.directional.offset.x + carPosition.x,
                    lights.directional.offset.y + carPosition.y,
                    lights.directional.offset.z + carPosition.z
                );

            };

            this.info = function() {

                return [

                    ['BASE', 'red'],
                    ['Position', this.position.x.toFixed(1) + ' ' + this.position.y.toFixed(1) + ' ' + this.position.z.toFixed(1)],
                    ['N (long force direction)', this.N.x.toFixed(3) + ' ' + this.N.y.toFixed(3) + ' ' + this.N.z.toFixed(3)],
                    ['P (driving wheels direction)', this.P.x.toFixed(3) + ' ' + this.P.y.toFixed(3) + ' ' + this.P.z.toFixed(3)],
                    ['C (inertion force direction)', this.C.x.toFixed(3) + ' ' + this.C.y.toFixed(3) + ' ' + this.C.z.toFixed(3)],
                    ['Z local speed', this.speedV.z.toFixed(3)],
                    ['World Speed', this.worldSpeed.x.toFixed(1) + ' ' + this.worldSpeed.y.toFixed(1) + ' ' + this.worldSpeed.z.toFixed(1)],
                    ['Y Rotation', this.rotation.yAngle.toFixed(3)],
                    ['Inertion Y angle', this.inertionYAngle.toFixed(1)],
                    ['Scalar inertion speed', this.scalarInertionSpeed.toFixed(3)]

                ];

            };

            var parseBones = function(bs) {

                var wheels = [], car, turners = {};

                for(var i = 0, l = bs.length; i < l; i++) {

                    if(bs[i].name.indexOf('Spin') >= 0) {

                        wheels.push(bs[i]);

                    } else if(bs[i].name.indexOf('Turn') >= 0) {

                        turners[bs[i].name.substr(-1)] = bs[i];

                    } else if(bs[i].name.indexOf('Car') >= 0) {

                        car = bs[i];

                    };

                };

                return {wheels: wheels, car: car, turners: turners};

            };

            this.bones = parseBones(bones);

        }, car;

        keys.on(107 /*+*/, function() {transmission.gearUp();});
        keys.on(109 /*-*/, function() {transmission.gearDown();});

        var game = new (function() {

            var game = this;

            var init = function() {

                init.inProgress = true;

                loader.load(
                    'data/models/DodgeChallenger1970.js',
                    function(geometry, materials) {

                        for(var i = 0; i < materials.length; i++) {

                            if(materials[i].name == 'Car') {

                                materials[i] = app.data.carMaterial;
                                
                            };

                            materials[i].skinning = true;

                        };

                        var material = new THREE.MeshFaceMaterial(materials);

                        mesh = new THREE.SkinnedMesh(geometry, material);

                        mesh.castShadow = true;

                        scene.add(mesh);

                        car = new carModel(mesh.bones, mesh);

                        car.initDashboard();

                        lights.directional.target.position = skyBox.position = car.position;

                        game.carMesh = mesh;
                        game.car = car;

                        init = null;

                    }
                );

            };

            this.process = function() {

                if(init) {

                    if(!init.inProgress) {

                        init();

                    };

                } else {

                    car.process();

                };

            };

            this.mouse = function(meta, type, e) {

                if(type == 'move') {

                    car.operate(e.clientY, e.clientX);

                } else if(type == 'click') {

                    meta.changeState();

                } else if(type == 'wheel') {

                    var direction = e;

                    if(direction > 0) {

                        transmission.gearUp();

                    } else {

                        transmission.gearDown();

                    };

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