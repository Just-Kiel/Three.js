import './style/main.scss'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from './utils.js';
import createVehicle from './raycastVehicle.js';
import {cameraHelper} from './cameraHelper.js';
// import cannonDebugger from 'cannon-es-debugger'
import './menu.js'
import gsap from 'gsap'

const worldStep = 1/60;

const gWorld = new CANNON.World();
gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);
gWorld.gravity.set(0, -10, 0);
gWorld.defaultContactMaterial.friction = 1;
const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer(/*{antialias: true}*/{
    canvas: document.querySelector('.webgl')
});
const clock = new THREE.Clock()

// cannonDebugger(gScene, gWorld.bodies, {color: "red"})

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
     gRenderer.setSize(sizes.width, sizes.height)
 })

gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
gRenderer.setClearColor('#18276b')
document.body.appendChild(gRenderer.domElement);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.y = 3
camera.position.z = -10
gScene.add(camera)


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#FFFFFF', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 800)
pointLight.position.set(50, 500, -150)
gScene.add(pointLight)
// const secondLight = new THREE.PointLight(0xffffff, 1, 1200)
// secondLight.position.set(150, 0, 0)
// gScene.add(secondLight)

/**
 * Floor
 */
//Floor phys
const floorShape = new CANNON.Cylinder(245, 132, 150, 32)
const initFloorShape = new CANNON.Cylinder(28, 28, 1, 32)
const bridgeInitFloorShape = new CANNON.Box(new CANNON.Vec3(15, 1, 55))
const sphereCenterFloorShape = new CANNON.Sphere(85)
const caillou1Shape = new CANNON.Sphere(22)
const caillou2Shape = new CANNON.Sphere(15)
const caillou3Shape = new CANNON.Sphere(32)
const murHorizontalShape = new CANNON.Box(new CANNON.Vec3(20, 8, 2))
const murVerticalShape = new CANNON.Box(new CANNON.Vec3(4, 8, 30))
const floorBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -104, -48),
})
floorBody.addShape(floorShape)
floorBody.addShape(initFloorShape, new CANNON.Vec3(0, 96, 365))
floorBody.addShape(bridgeInitFloorShape, new CANNON.Vec3(0, 84, 290), new CANNON.Quaternion(-0.1, 0, 0))
floorBody.addShape(sphereCenterFloorShape, new CANNON.Vec3(0, 30, 0))
floorBody.addShape(caillou1Shape, new CANNON.Vec3(215, 75, 32))
floorBody.addShape(caillou2Shape, new CANNON.Vec3(180, 75, 25))
floorBody.addShape(caillou2Shape, new CANNON.Vec3(75, 75, 30))
floorBody.addShape(caillou2Shape, new CANNON.Vec3(145, 75, 50))
floorBody.addShape(murHorizontalShape, new CANNON.Vec3(0,96, 385))
floorBody.addShape(murVerticalShape, new CANNON.Vec3(-22,96, 355))
floorBody.addShape(murVerticalShape, new CANNON.Vec3(22,96, 355))
floorBody.addShape(caillou3Shape, new CANNON.Vec3(165, 75, 110))
floorBody.addShape(caillou1Shape, new CANNON.Vec3(138, 75, 75))

gWorld.addBody(floorBody)


var vehicle
const vehicleInitialPosition = new THREE.Vector3(0, 50, 320);
const test = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);
let resetVehicle = () => {};

var vehicleNewPosition, vehicleNewRotation
let jump = () => {};

var gameTpBody;

var pontGalleryBody, collideGallery

var pupitreArtistsBody

var ceremonieBody, collideCeremonie;

var IUTPhys;

var appareilPhys;

var hub;

// var commandes;

if ("ontouchstart" in document.documentElement){
    document.getElementById('commande').classList.add("hidden")
}

(async function init() {

    const [wheelGLTF, chassisGLTF, hubGLTF] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        utils.loadResource('model/Hub.gltf'),
    ]);

    const wheel = wheelGLTF.scene;
    const chassis = chassisGLTF.scene;

    hub = hubGLTF.scene

    gScene.add(hub)

    /**
     * Appareil Photo Anciens
     */
    // Physique collider
    const objPhys = new CANNON.Sphere(15)
    appareilPhys = new CANNON.Body({mass: 0})
    appareilPhys.addShape(objPhys, new CANNON.Vec3(160, -20, -110))
    gWorld.addBody(appareilPhys)
    // Physique
    const appareilBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(200, -20, -110)
    })
    appareilBody.addShape(objPhys)
    appareilBody.addShape(objPhys, new CANNON.Vec3(20, 0, 10))
    gWorld.addBody(appareilBody)


    /**
     * Cube IUT
     */
    // Physique
    const iutPhys = new CANNON.Box(new CANNON.Vec3(41, 45, 45))
    IUTPhys = new CANNON.Body({
        mass: 0, 
        shape: iutPhys,
        position: new CANNON.Vec3(0, 0, -255)
    })
    gWorld.addBody(IUTPhys)

    
    /**
     * Game Island
     */
    // Teleport Game phys
    const gameTpShape = new CANNON.Sphere(45)
    gameTpBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(170, -15, 160),
        shape: gameTpShape,
        collisionResponse: 0
    })
    gWorld.addBody(gameTpBody)
    

    /**
     * Cérémonie
     */
    // Barrières
    const barriereShape = new CANNON.Box(new CANNON.Vec3(65,5,2))
    const ceremonieBridgeShape = new CANNON.Box(new CANNON.Vec3(50, 1, 20))
    collideCeremonie = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(-240, -23, -35),
        quaternion: new CANNON.Quaternion(0, -0.01, 0)
    })
    collideCeremonie.addShape(barriereShape)
    collideCeremonie.addShape(barriereShape, new CANNON.Vec3(0, 0, -30))
    collideCeremonie.addShape(ceremonieBridgeShape, new CANNON.Vec3(0, -7, -15))
    gWorld.addBody(collideCeremonie)

    const ceremonieShape = new CANNON.Box(new CANNON.Vec3(18,15,15))
    ceremonieBody = new CANNON.Body({
        mass: 0,
        shape: ceremonieShape,
        position: new CANNON.Vec3(-300, -15, -50), 
    })
    gWorld.addBody(ceremonieBody)

    /**
     * Nommés
     */
    // Collider pupitre
    const pupitreShape = new CANNON.Box(new CANNON.Vec3(15,5,15))
    const pontArtistShape = new CANNON.Box(new CANNON.Vec3(12,1, 25))
    pupitreArtistsBody = new CANNON.Body({
        mass: 0,
        shape: pupitreShape,
        position: new CANNON.Vec3(-155, -23, -205),
        quaternion: new CANNON.Quaternion(0, 0.4, 0)
    })
    pupitreArtistsBody.addShape(pontArtistShape, new CANNON.Vec3(0, 0, 40), new CANNON.Quaternion(Math.PI*0.04, 0, 0))
    gWorld.addBody(pupitreArtistsBody)

    // Collider vers la page des nommés
    const collideArtistsShape = new CANNON.Box(new CANNON.Vec3(5,5,5))
    const collideArtists = new CANNON.Body({
        mass: 0,
        shape: collideArtistsShape,
        position: new CANNON.Vec3(-155, -10, -205),
    })
    gWorld.addBody(collideArtists)

/**
 * Galerie
 */
    const bridgeShape = new CANNON.Box(new CANNON.Vec3(45, 1, 180))
    pontGalleryBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(-205, -30, 100) ,
        quaternion: new CANNON.Quaternion(0, -Math.PI*0.14, 0)
    })
    pontGalleryBody.addShape(bridgeShape)
    gWorld.addBody(pontGalleryBody)

    // Collider vers galerie
    const collideShape = new CANNON.Box(new CANNON.Vec3(35, 10, 30))
    collideGallery = new CANNON.Body({
        mass:0,
        shape: collideShape,
        position: new CANNON.Vec3(-305, -20, 170),
        collisionResponse: 0
    })
    gWorld.addBody(collideGallery)

    /**
     * Van
     */
    chassis.scale.set(2, 2, 2);
    wheel.scale.set(1.2, 1.2, 1.2)

    const meshes = {
        wheel_front_r: wheel,
        wheel_front_l: wheel.clone(),
        wheel_rear_r: wheel.clone(),
        wheel_rear_l: wheel.clone(),
        chassis,
    };

    vehicle = createVehicle();
    vehicle.addToWorld(gWorld, meshes);
    var interactable = [collideGallery, collideArtists, ceremonieBody, IUTPhys, appareilPhys, gameTpBody]
    vehicle.detectBody(interactable)

    resetVehicle = () => {
        vehicle.chassisBody.position.copy(vehicleInitialPosition);
        vehicle.chassisBody.quaternion.copy(vehicleInitialRotation);
        vehicle.chassisBody.velocity.set(0, 0, 0);
        vehicle.chassisBody.angularVelocity.set(0, 0, 0);
    };
    resetVehicle();

    // mirror meshes suffixed with '_l'
    Object.keys(meshes).forEach((meshName) => {
        if (meshName.split('_')[2] === 'l') {
            ['x', 'y', 'z'].forEach(axis => meshes[meshName].scale[axis] *= -1);
        }
        gScene.add(meshes[meshName]);
    });

    cameraHelper.init(camera, chassis, gRenderer.domElement, 5);
    
    render();
})();

function updatePhysics() {
    gWorld.step(worldStep);
}

function render() {

    const elapsedTime = clock.getElapsedTime()

    updatePhysics();

    cameraHelper.update();

    if(vehicle.chassisBody.quaternion.x < -0.6 || vehicle.chassisBody.quaternion.x > 0.6){
        vehicleNewPosition = vehicle.chassisBody.position;
        vehicleNewRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);

        setTimeout(function(){
            jump = () => {
                vehicleNewPosition.y = vehicle.chassisBody.position.y +0.2;
                gsap.to(vehicle.chassisBody, {duration: 2000, position: vehicleNewPosition});
                vehicle.chassisBody.quaternion.copy(vehicleNewRotation);
                vehicle.chassisBody.velocity.set(0, 0, 0);
                vehicle.chassisBody.angularVelocity.set(0, 0, 0);            
            }
            jump()
        }, 2000)
    }


    hub.children[16].children[1].rotateOnAxis(new THREE.Vector3(0, 1, 0), -0.008)

    gRenderer.render(gScene, camera);

    if(vehicle.chassisBody.position.y <= -100){
        resetVehicle()
    }

    requestAnimationFrame(render);    
}

window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'V':
            resetVehicle();
            break;
            
        case 'B':
            console.log(test)
            console.log(vehicle.indexUpAxis)
            console.log(vehicle.wheelInfos)
            console.log(vehicle.chassisBody)
            console.log(vehicle.chassisBody.quaternion.y)
            break;
    }
});

if ("ontouchstart" in document.documentElement)
{
    var replay = document.getElementById("replay")

    replay.ontouchstart = function(){
        resetVehicle()
    }
    replay.ontouchend = function(){
        console.log("reset")
    }
}