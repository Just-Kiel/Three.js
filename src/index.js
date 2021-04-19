import './style/main.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as BABYLON from 'babylonjs';

var leftJoystick = new BABYLON.VirtualJoystick(true)
leftJoystick.setJoystickColor("#EC623F")
leftJoystick.setJoystickSensibility(0.3)

var rightJoystick = new BABYLON.VirtualJoystick(false)
rightJoystick.setJoystickSensibility(0.3)


//Loader
const loadingManager = new THREE.LoadingManager(
    () =>
    {
        console.log('charged')
        document.getElementById("load").classList.add("hidden");
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
 const gltfLoader = new GLTFLoader(loadingManager)

 let mixer = null
 var cat

 gltfLoader.load(
     '/model/new_cat.gltf',
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
camera.position.y = 3
camera.position.z = 5
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

const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const cubeBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: cubeShape
})
cubeBody.addEventListener('collide', playHitSound)
world.addBody(cubeBody)

//Floor phys
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

// Test
const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1), 
    new THREE.MeshStandardMaterial({color: '#EC623F'})
)
cube.position.y = 1.5
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
    if(leftJoystick.pressed){
        machineBody.position.x += leftJoystick.deltaPosition.x * 0.01
    }
    if(rightJoystick.pressed){
        machineBody.position.z -= rightJoystick.deltaPosition.y * 1
    }

    // Update physics world
    world.step(1/60, deltaTime, 3)

    // Update world
    cube.position.copy(cubeBody.position)
    cube.quaternion.copy(cubeBody.quaternion)

    if(cat){
        cat.position.copy(machineBody.position)
    }

    // Update camera
    if(cat){
        camera.position.x = cat.position.x
        camera.position.z = cat.position.z + 5
    
        camera.lookAt(cat.position)
    }

    // Render
    renderer.render(scene, camera)

    // Keep looping
    window.requestAnimationFrame(loop)
}
loop()


window.addEventListener("keydown", keysPressed, false);
window.addEventListener("keyup", keysReleased, false);
window.addEventListener("touchmove", handleMove, false);

var keys = [];

function keysPressed(e) {
	// store an entry for every key pressed
	keys[e.keyCode] = true;
	
	// Up and Left
	if (keys[37] && keys[38]) {
		machineBody.position.x -= 0.05
        machineBody.position.z -= 0.05
        renderer.render(scene, camera)
	}
    // Up and Right
	if (keys[39] && keys[38]) {
		machineBody.position.x += 0.05
        machineBody.position.z -= 0.05
        renderer.render(scene, camera)
	}

    // Down and Left
	if (keys[37] && keys[40]) {
		machineBody.position.x -= 0.05
        machineBody.position.z += 0.05
        renderer.render(scene, camera)
	}
    // Down and Right
	if (keys[39] && keys[40]) {
		machineBody.position.x += 0.05
        machineBody.position.z += 0.05
        renderer.render(scene, camera)
	}

    // Left
	if (keys[37]) {
		machineBody.position.x -= 0.05
        renderer.render(scene, camera)
	}
    // Right
	if (keys[39]) {
		machineBody.position.x += 0.05
        renderer.render(scene, camera)
	}

    // Up
	if (keys[40]) {
        machineBody.position.z += 0.05
        renderer.render(scene, camera)
	}

    // Down
	if (keys[38]) {
        machineBody.position.z -= 0.05
        renderer.render(scene, camera)
	}

}

function keysReleased(e) {
	// mark keys that were released
	keys[e.keyCode] = false;
}

function handleMove(e) {
    if(leftJoystick.pressed){
        console.log(leftJoystick.deltaPosition.x)
        machineBody.position.x += leftJoystick.deltaPosition.x * 5
    }
    console.log(e.type, e.touches)
    //machineBody.position.z = e
}