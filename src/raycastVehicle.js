// import controllerSocketHandler from './socketHandler.js';
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
// import * as BABYLON from 'babylonjs'

export default function createVehicle() {
    const chassisBody = new CANNON.Body({mass: 100});
    const chassisBaseShape = new CANNON.Box(new CANNON.Vec3(4, 1.6, 9.2));
    const chassisTopShape = new CANNON.Box(new CANNON.Vec3(4, 1.6, 9));
    const chassisCylinderShape = new CANNON.Cylinder(2, 2, 10)
    chassisBody
        //.addShape(chassisCylinderShape, new CANNON.Vec3(0, 0, 0), new CANNON.Quaternion(0.9, 0.1, 0.1))
        .addShape(chassisBaseShape, new CANNON.Vec3(0, -2, 0.5))
        .addShape(chassisTopShape, new CANNON.Vec3(0, 1, 0.8));

    const wheelOptions = {
        radius: 1.4,
        directionLocal: new CANNON.Vec3(0, -1, 0),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 1,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence:  0.5,
        axleLocal: new CANNON.Vec3(-1, 0, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true,
    };
    // Create the vehicle
    const vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,
        indexForwardAxis: 2,
        indexRightAxis: 0,
        indexUpAxis: 1,
    });
    
    const height = 4;
    wheelOptions.chassisConnectionPointLocal.set(3, -height, -5.5);
    vehicle.addWheel(wheelOptions);
    wheelOptions.chassisConnectionPointLocal.set(-3, -height, -5.5);
    vehicle.addWheel(wheelOptions);
    wheelOptions.chassisConnectionPointLocal.set(3, -height, 6.5);
    vehicle.addWheel(wheelOptions);
    wheelOptions.chassisConnectionPointLocal.set(-3, -height, 6.5);
    vehicle.addWheel(wheelOptions);

    const wheelBodies = [];
    const wheelOrientation = new CANNON.Quaternion();
    wheelOrientation.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);

    vehicle.wheelInfos.forEach((wheel) => {
        const wheelShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 8);
        const wheelBody = new CANNON.Body({
            type: CANNON.Body.KINEMATIC,
            collisionFilterGroup: 0, // turn off collisions
        });
        wheelBody.addShape(wheelShape, CANNON.Vec3.ZERO, wheelOrientation);
        wheelBodies.push(wheelBody);
    });
    
    let transform;
    let wheelBody;
    function updateVisuals(chassisMesh, wheelMeshes) {

        for (let i = 0; i < this.wheelInfos.length; i++) {
            this.updateWheelTransform(i);
            transform = this.wheelInfos[i].worldTransform;
            wheelBody = wheelBodies[i];

            wheelBody.position.copy(transform.position);
            wheelBody.quaternion.copy(transform.quaternion);

            wheelMeshes[i].position.copy(wheelBody.position);
            wheelMeshes[i].quaternion.copy(wheelBody.quaternion);
        }
        chassisMesh.position.copy(chassisBody.position);
        chassisMesh.quaternion.copy(chassisBody.quaternion);
        chassisMesh.translateOnAxis(new THREE.Vector3(0, 0, 1), 0.6);
    }

    
    vehicle.detectBody = function(interactBodies){
        chassisBody.addEventListener('collide', interact)
        function interact(i){
            var path = window.location.pathname;
            var page = path.split("/").pop();
            
            if(page == "index.html" || page == ""){
                if(i.body.id == interactBodies[0].id){
                    // window.location.pathname = "./gallery.html";
                    window.location.pathname = "./immersions/gallery.html";
                }
                if(i.body.id == interactBodies[1].id){
                    // window.location.pathname = './artists.html'
                    window.location.pathname = "./immersions/artists.html";
                }
                if(i.body.id == interactBodies[2].id){
                    window.open("https://www.youtube.com/channel/UCNiWu4M9VCs8Sn-x9lcQjag")
                }
                // if(i.body.id == interactBodies[3].id){
                //     // window.location.pathname = "./game.html";
                //     window.location.pathname = "./immersions/game.html";
                // }
            }

            if(page == "game.html"){
                if(i.body.id == interactBodies[0].id){
                    window.location.pathname = "./immersions/index.html";
                    // window.location.pathname = "./index.html";
                }
                if(i.body.id == interactBodies[1].id){
                    console.log("start colormudar")
                    window.open("https://just-kiel.itch.io/colormudar")
                }
                if(i.body.id == interactBodies[2].id){
                    console.log("start fear of daemon")
                    window.open("https://kangourou-gang.itch.io/fear-of-daemon")
                }
                if(i.body.id == interactBodies[3].id){
                    console.log("start Boom boom escape")
                    window.open("https://valentin-prieto.itch.io/boom-boom-escape")
                }

            }

            if(page == "gallery.html"){
                if(i.body.id == interactBodies[0].id){
                    window.location.pathname = "./immersions/index.html";
                    // window.location.pathname = "./index.html";
                }
            }

            if(page == "mentions_legales.html"){
                if(i.body.id == interactBodies[0].id){
                    window.location.pathname = "./immersions/index.html";
                    // window.location.pathname = "./index.html"
                }
            }
        
        }
    }

    function beforeAddToWorld(world, meshes) {
        const wheelMeshes = [
            meshes['wheel_front_l'], meshes['wheel_front_r'], meshes['wheel_rear_l'], meshes['wheel_rear_r'],
        ];
        wheelBodies.forEach(wheelBody => world.addBody(wheelBody));
        world.addEventListener('postStep', updateVisuals.bind(vehicle, meshes['chassis'], wheelMeshes));    

        initControls(vehicle);
    }

    const addToWorld = vehicle.addToWorld.bind(vehicle);
    vehicle.addToWorld = function(world, meshes) {
        beforeAddToWorld(world, meshes);
        addToWorld(world);
    };

    const maxAcceleration = 1000;
    const maxSteeringValue = 0.4;
    const maxBrakeForce = 700;
    
    const minValues = {
        acceleration: -maxAcceleration,
        steeringValue: -maxSteeringValue,
        brakeForce: 0,
    };
    
    const maxValues = {
        acceleration: maxAcceleration,
        steeringValue: maxSteeringValue,
        brakeForce: maxBrakeForce,
    };
    
    const state = {
        acceleration: 0,
        steeringValue: 0,
        brakeForce: 0,
    };

    // controllerSocketHandler.connectToServer();
    // controllerSocketHandler.onmessage = (action) => {
    //     setState({[action.target]: action.value});
    // };

    function setState(properties) {
        let stateChanged = false;
        Object.keys(properties).forEach(property => {
            if (state.hasOwnProperty(property) && state[property] !== properties[property]) {
                state[property] = getLimitedValue(properties[property], minValues[property], maxValues[property]);
                stateChanged = true;
            }
        });

        if (stateChanged) {
            onStateChange();
        }
    }

    function onStateChange() {
        [0, 1, 2, 3].forEach(wheelIndex => vehicle.applyEngineForce(state.acceleration * maxAcceleration, wheelIndex));
    
        [0, 1].forEach(wheelIndex => vehicle.setSteeringValue(state.steeringValue * -1, wheelIndex));
    
        [0, 1, 2, 3].forEach(wheelIndex => vehicle.setBrake(state.brakeForce, wheelIndex));
    }

    return vehicle;
}



function getLimitedValue(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

//// keyboard controls ////

function initControls(vehicle) {
    const keysPressed = new Set();
    const isKeyDown = (keyCode) => keysPressed.has(keyCode);

    var path = window.location.pathname;
    var page = path.split("/").pop();

    if ("ontouchstart" in document.documentElement)
    {
        var left = document.getElementById("gauche")
        var right = document.getElementById("droite")
        var up = document.getElementById("haut")
        var down = document.getElementById("bas")
        if(left){
        left.classList.remove("hidden")
        }
        if(right){
        right.classList.remove("hidden")
        }
        up.classList.remove("hidden")
        down.classList.remove("hidden")
        document.getElementById("replay").classList.remove("hidden")
    // var leftJoystick = new BABYLON.VirtualJoystick(true)
    // leftJoystick.setJoystickColor("#EC623F")
    }

    var direction
    var steeringDirection
    const maxSteeringValue = 0.7;
    const joystickMaxSteeringValue = 0.9;
    const maxForceOnFrontWheels = 150;
    const maxForceOnRearWheels = 225;
    const brakeForce = 200;

    const liftingPoint = new CANNON.Vec3();
    const liftingForce = new CANNON.Vec3(0, 360, 0);
    const upAxis = new CANNON.Vec3(0, 1, 0);
    let pressedKey;

    if ("ontouchstart" in document.documentElement)
    {
        console.log("touch")
        steeringDirection = 0
        direction = 0

        if(left){
        left.ontouchstart = function(){
            if(page != "gallery.html"){
            steeringDirection = 1
        } else {
            steeringDirection = 0
        }
        [2, 3].forEach(wheelIndex => vehicle.setSteeringValue(maxSteeringValue * steeringDirection, wheelIndex));
        }
        
        left.ontouchend = function(){
            if(page != "gallery.html"){
            steeringDirection = 0
        }
        [2, 3].forEach(wheelIndex => vehicle.setSteeringValue(maxSteeringValue * steeringDirection, wheelIndex));
        }
        }
        
        if(right){
        right.ontouchstart = function(){
            if(page != "gallery.html"){
            steeringDirection = -1
        } else {
            steeringDirection = 0
        }
        [2, 3].forEach(wheelIndex => vehicle.setSteeringValue(maxSteeringValue * steeringDirection, wheelIndex));
        }
        
        right.ontouchend = function(){
            if(page != "gallery.html"){
            steeringDirection = 0
        }
        [2, 3].forEach(wheelIndex => vehicle.setSteeringValue(maxSteeringValue * steeringDirection, wheelIndex));
        }
        }
        
        up.ontouchstart = function(){
            if(page != ""){
            direction =-1
            }
            [0, 1].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnFrontWheels * direction, wheelIndex));
            [2, 3].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnRearWheels * direction, wheelIndex));
        }
        
        up.ontouchend = function(){
            if(page != ""){
            direction =0
            }
            [0, 1].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnFrontWheels * direction, wheelIndex));
            [2, 3].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnRearWheels * direction, wheelIndex));
        }
        
        down.ontouchstart = function(){
            if(page != ""){
            direction =1
            }
            [0, 1].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnFrontWheels * direction, wheelIndex));
            [2, 3].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnRearWheels * direction, wheelIndex));
        }
        
        down.ontouchend = function(){
            if(page != ""){
            direction =0
            }
            [0, 1].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnFrontWheels * direction, wheelIndex));
            [2, 3].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnRearWheels * direction, wheelIndex));
        }

    // ontouchstart = ontouchmove = ontouchend = (e) => {


            // direction = leftJoystick.deltaPosition.y > 0 ? -2 : leftJoystick.deltaPosition.y < 0 ? 3 : 0;



            // if(page != "gallery.html"){
            //     // steeringDirection = leftJoystick.deltaPosition.x < 0 ? 1 : leftJoystick.deltaPosition.x > 0 ? -1 : 0;
            // } else {
            //     steeringDirection = 0
            // }

            // if(!leftJoystick.pressed){
            //     direction = 0
            //     steeringDirection = 0
            // }
            // [0, 1].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnFrontWheels * direction, wheelIndex));
            // [2, 3].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnRearWheels * direction, wheelIndex));

            // [2, 3].forEach(wheelIndex => vehicle.setSteeringValue(joystickMaxSteeringValue * steeringDirection, wheelIndex));
    // }
}

    onkeydown = onkeyup = (e) => {
        pressedKey = e.key.toUpperCase();
        //preventPageScrolling(e);
        if (isKeyDown('H')) {
            vehicle.chassisBody.quaternion.vmult(upAxis, liftingPoint);
            vehicle.chassisBody.position.vadd(liftingPoint, liftingPoint);
            vehicle.chassisBody.applyForce(liftingForce, liftingPoint);

            vehicle.chassisBody.angularDamping = 0.9;
            vehicle.chassisBody.linearDamping = 0.9;
        } else {
            vehicle.chassisBody.angularDamping = 0.01;
            vehicle.chassisBody.linearDamping = 0.01;
        }

        if (e.type === 'keydown' && e.repeat) {
            return;
        }
        if (e.type === 'keyup') {
            keysPressed.delete(pressedKey);
        } else {
            keysPressed.add(pressedKey);
        }

        direction = isKeyDown('S') ? 1 : isKeyDown('Z') ? -1 : 0;

        // const speed = vehicle.chassisBody.velocity.length();
        
        [0, 1].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnFrontWheels * direction, wheelIndex));
        [2, 3].forEach(wheelIndex => vehicle.applyEngineForce(maxForceOnRearWheels * direction, wheelIndex));
        

        if(page != "gallery.html"){
            steeringDirection = isKeyDown('Q') ? 1 : isKeyDown('D') ? -1 : 0;
        } else {
            steeringDirection = 0
        }
        [2, 3].forEach(wheelIndex => vehicle.setSteeringValue(maxSteeringValue * steeringDirection, wheelIndex));

        const brakeMultiplier = isKeyDown(' ') ? 1 : 0;
        [0, 1].forEach(wheelIndex => vehicle.setBrake(brakeForce * brakeMultiplier, wheelIndex));
        // [2, 3].forEach(wheelIndex => vehicle.setBrake(brakeForce * brakeMultiplier *0.5, wheelIndex));

    };
}

function preventPageScrolling(e) {
    const navigationKeys = [
        ' ',
        'PageUp',
        'PageDown',
        'End',
        'Home',
        'ArrowLeft',
        'ArrowUp',
        'ArrowRight',
        'ArrowDown',
    ];

    if (navigationKeys.includes(e.key)) {
        e.preventDefault();
    }
}
