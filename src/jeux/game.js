import '../style/main.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as BABYLON from 'babylonjs';
import gsap from 'gsap'

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

// Island Loader
var Island
const islandLoader = new GLTFLoader(loadingManager)

islandLoader.load(
    'model/floating_island.gltf',
    (island) =>
    {
        Island = island.scene
        Island.position.y = -62
        scene.add(Island)
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
const vanLoader = new GLTFLoader(loadingManager)

vanLoader.load(
    'model/van.gltf',
    (van) =>
    {
        van = van.scene
        van.scale.set(0.8, 0.8, 0.8)
        van.position.set(1, 1.5, 0)
        van.rotation.y = Math.PI

        car.add(van)
    }
)

/**
 * Texture Loader
 */
const textureLoader = new THREE.TextureLoader(loadingManager)

const colormudarTexture = textureLoader.load('/image/colormudar_startscreen.png')


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
    hitSound.volume = 0.5
    hitSound.currentTime = 0
    hitSound.play()
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

const carShape = new CANNON.Box(new CANNON.Vec3(1, 1.5, 2.2))
const carBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 1, 0),
    shape: carShape,
    material: defaultMaterial
})
carBody.addEventListener('collide', playHitSound)
carBody.addEventListener('collide', interact)

var colormudarEnable = false
function interact(i){
    if(i.body.id == gameTpBody.id){
        window.location.pathname = "./index.html";
    }
    if(i.body.id == colormudarBody.id){
        console.log("ça marche")
        colormudarHover.position.y=0
        colormudarEnable = true
    }
}
//playHitSound)
world.addBody(carBody)

// Interactable phys
const testShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const testBody = new CANNON.Body({
    mass: 120,
    position: new CANNON.Vec3(5, 1.5, 2),
    shape: testShape
})
world.addBody(testBody)

//Floor phys
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

// Teleport Game phys
const gameTpShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5))
const gameTpBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(7, 1.8, 12),
    shape: gameTpShape,
    material: defaultMaterial
})
world.addBody(gameTpBody)

// Voiture
const car = new THREE.Group()
car.position.y = 1
car.scale.set(0.5, 0.5, 0.5)
scene.add(car)

// Plane ColorMudar
const colormudarGeometry = new THREE.PlaneGeometry(9.5, 5.5)
const colormudar = new THREE.Mesh(
    colormudarGeometry,
    new THREE.MeshBasicMaterial({map: colormudarTexture})
)
colormudar.rotation.x = - Math.PI * 0.5
colormudar.position.y = 0.01
colormudar.position.x = -6
scene.add(colormudar)
const colormudarHover = new THREE.Mesh(
    new THREE.BoxBufferGeometry(9.5, 5.5, 0.01),
    new THREE.MeshBasicMaterial({color: '#ffffff'})
)
colormudarHover.rotation.x = - Math.PI * 0.5
colormudarHover.position.copy(colormudar.position)
colormudarHover.position.y = -0.01
colormudarHover.scale.multiplyScalar(1.05)
scene.add(colormudarHover)

// ColorMudar phys
const colormudarShape = new CANNON.Box(new CANNON.Vec3(4.5, 0.5, 2.3))
const colormudarBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(-6, 0.01, 0),
    shape: colormudarShape
})
world.addBody(colormudarBody)
console.log(colormudarBody)

// Test
const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1), 
    new THREE.MeshStandardMaterial({color: '#EC623F'})
)
cube.position.set(5, 1.5, 2)
scene.add(cube)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
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
    carBody.position.copy(car.position)
    carBody.quaternion.copy(car.quaternion)

    cube.position.copy(testBody.position)

    // Update camera
    if(car){
        camera.position.x = car.position.x
        camera.position.z = car.position.z + 15
    }

    
    camera.quaternion.copy(car.quaternion)
    camera.lookAt(car.position)

    // Render
    renderer.render(scene, camera)

    // Keep looping
    window.requestAnimationFrame(loop)
}
loop()


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
        car.translateZ(-0.25)
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

    if (colormudarEnable && keys[13]){
        //window.location.pathname = 'colormudar.html'
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
}