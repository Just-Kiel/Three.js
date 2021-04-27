import './style/main.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as BABYLON from 'babylonjs';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import Vehicle from './vehicle.js'

// Scene
const scene = new THREE.Scene()



/**
 * CANNON
 */
 const world = new CANNON.World()
 world.gravity.set(0, -9.82, 0)
 world.broadphase = new CANNON.SAPBroadphase(world)
 world.allowSleep = true


/**
 * Variables
 */
 const translateAxis = new THREE.Vector3(0, 0, 1);


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
 const gltfLoader = new GLTFLoader(loadingManager)

var allVan = []
var wheels = []
var vroum
const allVanLoader = new GLTFLoader(loadingManager)

allVanLoader.load(
    'model/VanRoues.gltf',
    (myVan) =>
    {
        myVan.scene.traverse((child) =>
        {
            if(child.hasOwnProperty('userData')){
                if(child.userData.hasOwnProperty('data')){
                    if(child.userData.data === 'wheel'){
                        wheels.push(child)
                    }  else {
                        allVan.push(child)
                    }
                 }
                }
                
        })
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
        
        //scene.add(wheel1)
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
        
        //car.add(wheel2)
     }
 )

 const wheel3Loader = new GLTFLoader(loadingManager)

 wheel3Loader.load(
     'model/roue.gltf',
     (roue) =>
     {
        wheel3 = roue.scene
        wheel3.scale.set(0.5, 0.5, 0.5)
        //wheel3.rotation.y = Math.PI

        wheel3.position.set(2.1, 0, 2.4)
        
        //car.add(wheel3)
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
        
        //car.add(wheel4)
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

        scene.add(van)
    }
)

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


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

camera.position.x = 4
camera.position.y = 10
camera.position.z = 12
scene.add(camera)

/**
 * Physics
 */


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


// Interactable phys
const testShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const testBody = new CANNON.Body({
    mass: 2,
    position: new CANNON.Vec3(5, 3, 2),
    shape: testShape
})
world.addBody(testBody)

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
// const car = new THREE.Group()
// car.position.y = 1
// car.scale.set(0.5, 0.5, 0.5)
// scene.add(car)

const chassisVan = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1), 
    new THREE.MeshStandardMaterial({color: '#EC623F'})
)

const wheelVan = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), 
    new THREE.MeshStandardMaterial({color: '#EC623F'})
)




// Test
const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1), 
    new THREE.MeshStandardMaterial({color: '#EC623F'})
)
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

const controls = new OrbitControls( camera, renderer.domElement );

// world.addEventListener('postStep', () =>
// {
//     for (var i = 0; i < vehicle.wheelInfos.length; i++) {
//         vehicle.updateWheelTransform(i);
//         var t = vehicle.wheelInfos[i].worldTransform;
//         wheelBodies[i].position.copy(t.position);
//         wheelBodies[i].quaternion.copy(t.quaternion);

//         wheels[i].position.copy(t.position)
//         wheels[i].quaternion.copy(t.quaternion)
//     }
// })

/**
 * Loop
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0
let engineForceDirection = 0;
    let steeringDirection = 0;

const loop = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics world
    world.step(1/60, deltaTime, 3)

    controls.update();

    if (wheel3 != undefined){        
        vroum = new Vehicle(van, wheel3)
        console.log('aled')
        console.log(vroum.base.chassisBody.position)
        vroum.base.chassisBody.position.set(-4, 7, 0)
        //vroum.base.chassisBody.position.set(7, 7, 1)
        vroum.addToWorld(world).addToScene(scene)
        wheel3 = undefined
    }

    // var tmp_transform

    //     if(vroum != undefined){
    //     for(let i = 0; i<vroum.base.wheelInfos.length; i++){
    //         //console.log(this.state.engineForce)
    //         //console.log(torqueDistribution[i])

    //         //vroum.base.applyEngineForce(-1500, i)

    //         tmp_transform = vroum.base.wheelInfos[i].worldTransform
    //             //console.log('help')
            
    //         //vroum.wheelMeshes[i].position.set(0, 0, 0)
    //         vroum.wheelMeshes[i].position.copy(tmp_transform.position)
    //         vroum.wheelMeshes[i].quaternion.copy(tmp_transform.quaternion)
            
    //     }
    //     //vroum.base.chassisBody.position.set(0, 0, 0)
    //     vroum.chassisMesh.position.copy(vroum.base.chassisBody.position)
    //     //console.log(this.chassisMesh.position)
    //     //console.log(this.chassisBody.position)
    //     vroum.chassisMesh.quaternion.copy(vroum.base.chassisBody.quaternion)
    //     vroum.chassisMesh.translateOnAxis(translateAxis, 0.6)
    // }

    // if(vroum != undefined){
    // vroum.addToWorld(world)
    // }


    // Update world
    // if(allVan[0]){
    //     allVan[0].position.copy(chassisBody.position)
    //     allVan[0].quaternion.copy(chassisBody.quaternion)
    // }

    //console.log(allVan[0])

    // if(allVan[0] && vroum != undefined){
    //     allVan[0].position.copy(vroum.chassisBody.position)
    //     allVan[0].quaternion.copy(vroum.chassisBody.quaternion)


    // }
    
    

        //console.log(engineForceDirection)
    //console.log(allVan[0])

    cube.position.copy(testBody.position)

    // Update camera
    // if(allVan[0]){
    //     camera.position.x = allVan[0].position.x
    //     camera.position.z = allVan[0].position.z + 15
    //     camera.quaternion.copy(allVan[0].quaternion)
    //     camera.lookAt(allVan[0].position)
    // }
    // if(vroum.chassisBody){
    // camera.lookAt(vroum.chassisBody.position)
    // }

    // Render
    renderer.render(scene, camera)

    // Keep looping
    window.requestAnimationFrame(loop)
}
loop()

world.addEventListener('postStep', () =>
        {
            // this.steerWheels()
            // this.applyWheelSlipReduction()
            // this.setEngineForceDirection()

        var tmp_transform

        if(vroum != undefined){
        for(let i = 0; i<vroum.base.wheelInfos.length; i++){
            //console.log(this.state.engineForce)
            //console.log(torqueDistribution[i])

            //vroum.base.applyEngineForce(-1500, i)
            

            vroum.base.updateWheelTransform(i)
            tmp_transform = vroum.base.wheelInfos[i].worldTransform
                //console.log('help')
            
            //vroum.wheelMeshes[i].position.set(0, 0, 0)
            vroum.wheelMeshes[i].position.copy(tmp_transform.position)
            vroum.wheelMeshes[i].quaternion.copy(tmp_transform.quaternion)
            
        }
        vroum.chassisMesh.position.copy(vroum.base.chassisBody.position)
        //console.log(this.chassisMesh.position)
        //console.log(this.chassisBody.position)
        vroum.chassisMesh.quaternion.copy(vroum.base.chassisBody.quaternion)
        vroum.chassisMesh.translateOnAxis(translateAxis, 0.6)
    }
        })


// Keybindings
        // Add force on keydown
        document.addEventListener('keydown', (event) => {
            const maxSteerVal = 0.5
            const maxForce = 2500
  
            switch (event.key) {
              case 'w':
              case 'ArrowUp':
                // for(let i = 0; i<vroum.base.wheelInfos.length; i++){
                //     vroum.base.applyEngineForce(-maxForce, i)
                    
                //     //console.log(vroum.base.wheelInfos[i].worldTransform)
                // }


                  
                vroum.base.applyEngineForce(-maxForce, 2)
                vroum.base.applyEngineForce(-maxForce, 3)

                break
  
              case 's':
              case 'ArrowDown':
                for(let i = 0; i<vroum.base.wheelInfos.length; i++){
                    vroum.base.applyEngineForce(maxForce, i)
                }
                // vroum.base.applyEngineForce(maxForce, 0)
                // vroum.base.applyEngineForce(maxForce, 1)
                break
  
              case 'a':
              case 'ArrowLeft':
                vroum.base.setSteeringValue(maxSteerVal, 2)
                vroum.base.setSteeringValue(maxSteerVal, 3)
                break
  
              case 'd':
              case 'ArrowRight':
                vroum.base.setSteeringValue(-maxSteerVal, 2)
                vroum.base.setSteeringValue(-maxSteerVal, 3)
                break
            }
          })
  
          // Reset force on keyup
          document.addEventListener('keyup', (event) => {
            switch (event.key) {
              case 'w':
              case 'ArrowUp':
                for(let i = 0; i<vroum.base.wheelInfos.length; i++){
                    vroum.base.applyEngineForce(0, i)
                }
                // vroum.base.applyEngineForce(0, 0)
                // vroum.base.applyEngineForce(0, 1)
                break
  
              case 's':
              case 'ArrowDown':
                for(let i = 0; i<vroum.base.wheelInfos.length; i++){
                    vroum.base.applyEngineForce(0, i)
                }
                // vroum.base.applyEngineForce(0, 0)
                // vroum.base.applyEngineForce(0, 1)
                break
  
              case 'a':
              case 'ArrowLeft':
                vroum.base.setSteeringValue(0, 2)
                vroum.base.setSteeringValue(0, 3)
                break
  
              case 'd':
              case 'ArrowRight':
                vroum.base.setSteeringValue(0, 2)
                vroum.base.setSteeringValue(0, 3)
                break
            }
          })




    


// window.addEventListener("keydown", navigate);
// window.addEventListener("keyup", navigate);

// function navigate(e) {
//     if (e.type != 'keydown' && e.type != 'keyup') return;
//     var keyup = e.type == 'keyup';
        
//     // vehicle.setBrake(0, 0);
//     // vehicle.setBrake(0, 1);
//     // vehicle.setBrake(0, 2);
//     // vehicle.setBrake(0, 3);
  
    
//     switch(e.keyCode) {
  
//       case 38: // forward
//       engineForceDirection = 1
//         // vehicle.applyEngineForce(keyup ? 0 : -engineForce, 2);
//         // vehicle.applyEngineForce(keyup ? 0 : -engineForce, 3);
//         break;
  
//       case 40: // backward
//       engineForceDirection = -1
//         // vehicle.applyEngineForce(keyup ? 0 : engineForce, 2);
//         // vehicle.applyEngineForce(keyup ? 0 : engineForce, 3);
//         break;
  
//       case 39: // right
//       steeringDirection = -1
//       engineForceDirection = 0
//         // vehicle.setSteeringValue(keyup ? 0 : -maxSteerVal, 2);
//         // vehicle.setSteeringValue(keyup ? 0 : -maxSteerVal, 3);
//         break;
  
//       case 37: // left
//       steeringDirection = 1
//       engineForceDirection = 0
//         // vehicle.setSteeringValue(keyup ? 0 : maxSteerVal, 2);
//         // vehicle.setSteeringValue(keyup ? 0 : maxSteerVal, 3);
//         break;
//     }

//     if(vroum){
//         //console.log(vroum)
//         //console.log(engineForceDirection)
//         vroum.setEngineForceDirection(engineForceDirection)
//         vroum.setSteeringDirection(steeringDirection)
//     }
    
//     //console.log(engineForceDirection)
//     //console.log(steeringDirection)

    
// }

var keys = {};

var delta = clock.getDelta()
var rotateAngle = Math.PI / 2 * delta

function keysPressed(e) {
	// store an entry for every key pressed
	keys[e.keyCode] = true;

    // Up
	if (keys[38]) {
        vehicle.applyEngineForce(-1000, 2)
        vehicle.applyEngineForce(-1000)
        // Left
	    if (keys[37]) {
        car.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);

        wheel1.rotation.set(0, rotateAngle*10, 0)
        wheel4.rotation.set(0, rotateAngle*10 + Math.PI, 0)

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