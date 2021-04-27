import './style/main.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as BABYLON from 'babylonjs';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'


/**
 * Variables
 */
var vanLength
var vanWidth
var vanHeight

if ("ontouchstart" in document.documentElement)
{
    var leftJoystick = new BABYLON.VirtualJoystick(true)
    leftJoystick.setJoystickColor("#EC623F")
    leftJoystick.setJoystickSensibility(0.3)

    var rightJoystick = new BABYLON.VirtualJoystick(false)
    rightJoystick.setJoystickSensibility(0.3)
}


//Loader
const loadingManager = new THREE.LoadingManager(
    () =>
    {
        console.log('charged')
        document.getElementById("load").onclick = function(){
        document.getElementById("load").classList.add("hidden");
        }
    }
)

// document.onreadystatechange = function(){
//     if (loaded){
//         //console.log("loaded");
//         document.getElementById("load").classList.add("hidden");
//     }
// };


/**
 * Models
 */
//  const dracoLoader = new DRACOLoader()
//  dracoLoader.setDecoderPath('/draco/')

 const gltfLoader = new GLTFLoader(loadingManager)
//gltfLoader.setDRACOLoader(dracoLoader)
 let mixer = null
 var cat

 gltfLoader.load(
     'model/new_cat.gltf',
     (gltf) =>
     {
         cat = gltf.scene
         //console.log(gltf)
         mixer = new THREE.AnimationMixer(cat)
         const action = mixer.clipAction(gltf.animations[1])
         action.play()
         cat.scale.set(0.25, 0.25, 0.25)
         cat.position.set(2, 0, 2)
         scene.add(cat)
     }
 )

 // Game Teleport Loader
 var gameTp
 const gameTpLoader = new GLTFLoader(loadingManager)

 gameTpLoader.load(
     'model/teleport_game.gltf',
     (tp) =>
     {
         gameTp = tp.scene
         gameTp.position.set(7, 1.8, 12)
         gameTp.scale.set(1.7, 1.7, 1.7)
         gameTp.rotation.set(Math.PI/2, 0, -Math.PI/4)

         scene.add(gameTp)
     }
 )

 // Wheel Loader
 var wheel1, wheel2, wheel3, wheel4
 const wheel1Loader = new GLTFLoader(loadingManager)

 wheel1Loader.load(
     'model/roue.gltf',
     (roue) =>
     {
        wheel1 = roue.scene
        wheel1.scale.set(0.5, 0.5, 0.5)

        wheel1.position.set(-0.1, 0, -2.3)
        
        car.add(wheel1)
     }
 )
const wheel2Loader = new GLTFLoader(loadingManager)

 wheel2Loader.load(
     'model/roue.gltf',
     (roue) =>
     {
        wheel2 = roue.scene
        wheel2.scale.set(0.5, 0.5, 0.5)

        wheel2.position.set(-0.1, 0, 2.4)
        
        car.add(wheel2)
     }
 )

 const wheel3Loader = new GLTFLoader(loadingManager)

 wheel3Loader.load(
     'model/roue.gltf',
     (roue) =>
     {
        wheel3 = roue.scene
        wheel3.scale.set(0.5, 0.5, 0.5)
        wheel3.rotation.y = Math.PI

        wheel3.position.set(2.1, 0, 2.4)
        
        car.add(wheel3)
     }
 )
const wheel4Loader = new GLTFLoader(loadingManager)

 wheel4Loader.load(
     'model/roue.gltf',
     (roue) =>
     {
        wheel4 = roue.scene
        wheel4.scale.set(0.5, 0.5, 0.5)
        wheel4.rotation.y = Math.PI

        wheel4.position.set(2.1, 0, -2.3)
        
        car.add(wheel4)
     }
 )

 // Van Loader
var van
const vanLoader = new GLTFLoader(loadingManager)

vanLoader.load(
    'model/van.gltf',
    (chassis) =>
    {
        van = chassis.scene
        van.scale.set(0.8, 0.8, 0.8)
        van.position.set(1, 1.5, 0)
        van.rotation.y = Math.PI

        car.add(van)
    }
)


/**
 * Debug
 */
 const gui = new dat.GUI()

/**
 * Sizes
 */
const sizes = {}
sizes.width = window.innerWidth
sizes.height = window.innerHeight

window.addEventListener('resize', () =>
{
    // Save sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
})

/**
 * Environnements
 */
// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 10
camera.position.z = 12
scene.add(camera)

/**
 * Sounds
 */
const hitSound = new Audio('/sound/hit.mp3')

const playHitSound = (collision) =>
{
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    if (impactStrength > 1.5){
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
    }
}


/**
 * Physics
 */
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true

// Materials
const concreteMaterial = new CANNON.Material('concrete')
const plasticMaterial = new CANNON.Material('plastic')
const defaultMaterial = new CANNON.Material('default')

const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    concreteMaterial,
    plasticMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(concretePlasticContactMaterial)

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

const machineShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const machineBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(2, 0, 2),
    shape: machineShape
})
world.addBody(machineBody)

var vehicle
var chassisShape = new CANNON.Box(new CANNON.Vec3(1, 1.5, 2.2))
var chassisBody = new CANNON.Body({mass: 150})
chassisBody.addShape(chassisShape)
chassisBody.position.set(0, 4, 0)
//chassisBody.quaternion.set(0, 0, 0, Math.PI/4)
//chassisBody.angularVelocity.set(0,0,0.5)

var options = {
    radius: 0.5,
    //directionLocal: new CANNON.Vec3(0, 0, 1),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence:  0.01,
    //axleLocal: new CANNON.Vec3(0, 1, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
}

vehicle = new CANNON.RaycastVehicle({
    chassisBody: chassisBody
})

options.chassisConnectionPointLocal.set(1, 1, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(1, -1, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(-1, 1, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(-1, -1, 0);
vehicle.addWheel(options);

vehicle.addToWorld(world);

var wheelBodies = [];
for(var i=0; i<vehicle.wheelInfos.length; i++){
    var wheel = vehicle.wheelInfos[i];
    var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
    var wheelBody = new CANNON.Body({ mass: 1 });
    var q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
    wheelBodies.push(wheelBody);
}




const carShape = new CANNON.Box(new CANNON.Vec3(1, 1.5, 2.2))
const carBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 1, 0),
    shape: carShape
})
carBody.addEventListener('collide', interact)
//playHitSound)
world.addBody(carBody)

function interact(i){
    if(i.body.id == testBody.id){
        console.log("test")
    }
    if(i.body.id == gameTpBody.id){
        window.location.pathname = "./game.html";
    }
}

// Interactable phys
const testShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const testBody = new CANNON.Body({
    mass: 2,
    position: new CANNON.Vec3(5, 1.5, 2),
    shape: testShape
})
world.addBody(testBody)

// Teleport Game phys
const gameTpShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5))
const gameTpBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(7, 1.8, 12),
    shape: gameTpShape
})
world.addBody(gameTpBody)

//Floor phys
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    material: concreteMaterial
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

// Voiture
const car = new THREE.Group()
car.position.y = 1
car.scale.set(0.5, 0.5, 0.5)
scene.add(car)

// Test
const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1), 
    new THREE.MeshStandardMaterial({color: '#EC623F'})
)
cube.position.set(5, 1.5, 2)
scene.add(cube)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({color: '#4960A9'})
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
floor.position.z = 2
scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 1)
scene.add(ambientLight)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.webgl')
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor('#364689')

//Axes Helper
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

/**
 * Loop
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0
const loop = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update Animation
    if (mixer){
        mixer.update(deltaTime)
    }

    // Update Joystick
    if ("ontouchstart" in document.documentElement)
    {
        if(leftJoystick.pressed){
            car.rotateOnAxis( new THREE.Vector3(0,1,0), -leftJoystick.deltaPosition.x);
            //car.position.x += leftJoystick.deltaPosition.x * 1
        }
        if(rightJoystick.pressed){
            car.translateZ(-rightJoystick.deltaPosition.y * 5)
            //car.position.z -= rightJoystick.deltaPosition.y * 1
        }
    }

    // Update physics world
    world.step(1/60, deltaTime, 3)

    // Update world
    if(van){
    van.position.copy(chassisBody.position)
    van.quaternion.copy(chassisBody.quaternion)

    // wheel1.position.copy(wheelBodies[1].position)
    // wheel1.quaternion.copy(wheelBodies[1].quaternion)
    // wheel2.position.copy(wheelBodies[1].position)
    // wheel2.quaternion.copy(wheelBodies[1].quaternion)
    // wheel3.position.copy(wheelBodies[2].position)
    // wheel3.quaternion.copy(wheelBodies[2].quaternion)
    // wheel4.position.copy(wheelBodies[3].position)
    // wheel4.quaternion.copy(wheelBodies[3].quaternion)
    }

    //carBody.position.copy(car.position)
    //carBody.quaternion.copy(car.quaternion)

    cube.position.copy(testBody.position)

    if(gameTp){
    gameTpBody.position.copy(gameTp.position)
    gameTpBody.quaternion.copy(gameTp.quaternion)
    }

    if(cat){
        cat.position.copy(machineBody.position)
    }

    // Update camera
    // if(cat){
    //     camera.position.x = cat.position.x
    //     camera.position.z = cat.position.z + 5
    
    //     //camera.lookAt(cat.position)
    // }

    if(van){
        camera.position.x = van.position.x
        camera.position.z = van.position.z + 15
        camera.quaternion.copy(van.quaternion)
        camera.lookAt(van.position)
    }

    
    
    

    // Render
    renderer.render(scene, camera)

    // Keep looping
    window.requestAnimationFrame(loop)
}
loop()

world.addEventListener('postStep', () =>
{
    for (var i = 0; i < vehicle.wheelInfos.length; i++) {
        vehicle.updateWheelTransform(i);
        var t = vehicle.wheelInfos[i].worldTransform;
        wheelBodies[i].position.copy(t.position);
        wheelBodies[i].quaternion.copy(t.quaternion);
    }
})


window.addEventListener("keydown", keysPressed, false);
window.addEventListener("keyup", keysReleased, false);
//window.addEventListener("touchmove", handleMove, false);

var keys = {};

var delta = clock.getDelta()
var rotateAngle = Math.PI / 2 * delta

function keysPressed(e) {
	// store an entry for every key pressed
	keys[e.keyCode] = true;

    // Up
	if (keys[38]) {
        vehicle.applyEngineForce(-1000, 2)
        vehicle.applyEngineForce(-1000, 3)
        //car.translateZ(-0.25)
        wheel1.rotation.set(0, 0, 0)
        wheel4.rotation.set(0, Math.PI, 0)
        wheel1.rotation.x -= 0.05
        wheel2.rotation.x -= 0.05
        wheel3.rotation.x -= 0.05
        wheel4.rotation.x -= 0.05
        // Left
	    if (keys[37]) {
        car.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);

        wheel1.rotation.set(0, rotateAngle*10, 0)
        wheel4.rotation.set(0, rotateAngle*10 + Math.PI, 0)

        //gsap.to(wheel1.rotation, {duration: 2, x:0, y: rotateAngle*10, z: 0})
        //gsap.to(wheel4.rotation, {duration: 2, x:0, y: rotateAngle*10 + Math.PI, z: 0})
	    }else 
        // Right
	    if (keys[39]) {
		car.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle)
        wheel1.rotation.set(0, -rotateAngle*10, 0)
        wheel4.rotation.set(0, -rotateAngle*10 + Math.PI, 0)
	    }
	} else

    // Down
	if (keys[40]) {
        car.translateZ(0.25)
        wheel1.rotation.set(0, 0, 0)
        wheel4.rotation.set(0, Math.PI, 0)
        wheel1.rotation.x += 0.05
        wheel2.rotation.x += 0.05
        wheel3.rotation.x += 0.05
        wheel4.rotation.x += 0.05
	}

    renderer.render(scene, camera)

}

function keysReleased(e) {
	// mark keys that were released
	keys[e.keyCode] = false;
}

function handleMove(e) {
    if(leftJoystick.pressed){
        console.log(leftJoystick.deltaPosition.x)
        carBody.position.x += leftJoystick.deltaPosition.x * 5
    }
    console.log(e.type, e.touches)
    //machineBody.position.z = e
}