import '../style/main.scss'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from '../utils.js';
import createVehicle from '../raycastVehicle.js';
import {cameraHelper} from '../cameraHelper.js';
import '../menu.js'
// import cannonDebugger from 'cannon-es-debugger'
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
gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
gRenderer.setClearColor('#18276b')
document.body.appendChild(gRenderer.domElement);

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
// const ambientLight = new THREE.AmbientLight('#686868', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 1000)
pointLight.position.set(50, 100, 150)
gScene.add(pointLight)

/**
 * Test de jeu de physique
 */
// // Ball fun
// const ballGeometry = new THREE.SphereGeometry(5, 32, 32)
// const ballMaterial = new THREE.MeshBasicMaterial({color: 0xff0000})
// const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial)
// gScene.add(ballMesh)

// // Ball phys
// const ballShape = new CANNON.Sphere(5)
// const ballBody = new CANNON.Body({mass: 1, shape: ballShape, position: new CANNON.Vec3(-15, 15, 8)})
// gWorld.addBody(ballBody)

/**
 * Floor
 */
//Floor phys
const floorShape = new CANNON.Cylinder(120, 1, 30)
const floorBody1 = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(0, -15, 0)
})
const floorBody2 = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(0, -15.8, 390),
    quaternion: new CANNON.Quaternion(-0.005, 0, 0.005)
})
const floorShapeBig = new CANNON.Cylinder(170, 1, 30)
const floorBody3 = new CANNON.Body({
    mass: 0,
    shape: floorShapeBig,
    position: new CANNON.Vec3(340, -45.4, 630),
})
gWorld.addBody(floorBody1)
gWorld.addBody(floorBody2)
gWorld.addBody(floorBody3)

/**
 * Bridges
 */
const bridgeShape1 = new CANNON.Box(new CANNON.Vec3(20, 1, 110))
const floorBodyBridge1 = new CANNON.Body({
    mass: 0,
    shape: bridgeShape1,
    position: new CANNON.Vec3(0, -1.8, 200)
})
gWorld.addBody(floorBodyBridge1)

const bridgeShape2 = new CANNON.Box(new CANNON.Vec3(25, 3, 106))
const floorBodyBridge2 = new CANNON.Body({
    mass: 0,
    shape: bridgeShape2,
    position: new CANNON.Vec3(179, -18.2, 504),
    quaternion: new CANNON.Quaternion(0.088, 0.4, -0.015)
})
gWorld.addBody(floorBodyBridge2)


const vehicleInitialPosition = new THREE.Vector3(340, 15, 750);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
let resetVehicle = () => {};

var gameTp, gameTpBody
var gameTpSize = 30

var colormudarBody, colormudar, planeEnterColor
var fearOfDaemon, fearOfDaemonBody, planeEnterFear
var boomBoomEscape, boomBoomEscapeBody, planeEnterBoom

var island

var vehicle;
var longueur = 76;
var largeur = 40;

(async function init() {

    const [wheelGLTF, chassisGLTF, islandGLTF, colormudarPNG, fearOfDaemonPNG, boomBoomEscapePNG, enterPNG] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        // utils.loadResource('model/Trou_Noir.gltf'),
        utils.loadResource('model/Floating_Island.gltf'),
        utils.loadResource('image/colormudar_startscreen.png'),
        utils.loadResource('image/fearOfDaemon_startscreen.png'),
        utils.loadResource('image/boomBoomEscape_startscreen.png'),
        utils.loadResource('image/enter.png'),
    ]);

    const wheel = wheelGLTF.scene;
    const chassis = chassisGLTF.scene;

    /**
     * Island
     */
    island = islandGLTF.scene
    island.position.set(0, -62.5, 390)
    gScene.add(island)

    /**
     * Teleport
     */
    // gameTp = gameTpGLTF.scene;
    // gameTp.position.set(7, 3.8, 12)
    // gameTp.scale.set(gameTpSize, gameTpSize, gameTpSize)
    // gameTp.rotation.set(Math.PI/2, 0, 0)
    // gScene.add(gameTp)

    // Teleport Game phys
    //pas de cylinder bc les collisions sont pas bonnes
    const gameTpShape = new CANNON.Box(new CANNON.Vec3(gameTpSize, gameTpSize, gameTpSize))
    gameTpBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(350, -10, 800),
        shape: gameTpShape,
        // quaternion: new CANNON.Quaternion(0, -1, -1)
    })
    const gameTpEnd = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(-10, 0, -150),
        shape: gameTpShape,
        // quaternion: new CANNON.Quaternion(0, -1, -1)
    })
    gWorld.addBody(gameTpBody)
    gWorld.addBody(gameTpEnd)

    // const gameLight = new THREE.PointLight(0xffffff, 2, 1000)
    // gameLight.position.set(450, 0, 670)
    // gScene.add(gameLight)

    /**
     * Jeux
     */
    // Plane First Game (ColorMudar)
    const gameGeometry = new THREE.PlaneGeometry(152, 88)
    colormudar = new THREE.Mesh(
        gameGeometry,
        new THREE.MeshBasicMaterial({map: colormudarPNG})
    )
    colormudar.rotation.set(-Math.PI*0.5, 0, -Math.PI*1.2)
    colormudar.position.set(400, -30, 580)
    gScene.add(colormudar)

    // ColorMudar phys
    const gameShape = new CANNON.Box(new CANNON.Vec3(longueur, largeur, 2))
    colormudarBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(400, -28, 580),
        shape: gameShape,
    })
    colormudarBody.collisionResponse = 0
    gWorld.addBody(colormudarBody)

    planeEnterColor = new THREE.Mesh(
        new THREE.PlaneGeometry(longueur*2, largeur*2),
        new THREE.MeshBasicMaterial({map: enterPNG, transparent: true})
        // new THREE.MeshStandardMaterial({color: "#FF0000", side: THREE.DoubleSide})
    )
    planeEnterColor.name = "Colormudar"
    planeEnterColor.rotateX(Math.PI * 0.5)
    planeEnterColor.position.set(colormudarBody.position.x, colormudarBody.position.y-2, colormudarBody.position.z)


    // Plane Game (Fear of Daemon)
    fearOfDaemon = new THREE.Mesh(
        gameGeometry,
        new THREE.MeshBasicMaterial({map: fearOfDaemonPNG})
    )
    fearOfDaemon.position.set(-25, 1.5, 410)
    fearOfDaemon.rotation.set(-Math.PI*0.5, 0, -Math.PI*1.3)
    gScene.add(fearOfDaemon)

    // Fear of Daemon phys
    fearOfDaemonBody = new CANNON.Body({
        mass: 0,
        shape: gameShape,
    })
    fearOfDaemonBody.collisionResponse = 0
    gWorld.addBody(fearOfDaemonBody)

    planeEnterFear = new THREE.Mesh(
        new THREE.PlaneGeometry(longueur*2, largeur*2),
        new THREE.MeshBasicMaterial({map: enterPNG, transparent: true})
    )
    planeEnterFear.name = "FearOfDaemon"
    planeEnterFear.rotateX(Math.PI * 0.5)
    planeEnterFear.position.set(fearOfDaemon.position.x, fearOfDaemon.position.y-2, fearOfDaemon.position.z)


    // Plane Game (Boom Boom Escape)
    boomBoomEscape = new THREE.Mesh(
        gameGeometry,
        new THREE.MeshBasicMaterial({map: boomBoomEscapePNG})
    )
    boomBoomEscape.position.set(-15, 0.8, -35)
    boomBoomEscape.rotation.set(-Math.PI*0.5, 0, -Math.PI*2)
    gScene.add(boomBoomEscape)

    // Boom Boom Escape phys
    boomBoomEscapeBody = new CANNON.Body({
        mass: 0,
        shape: gameShape,
    })
    boomBoomEscapeBody.collisionResponse = 0
    gWorld.addBody(boomBoomEscapeBody)

    planeEnterBoom = new THREE.Mesh(
        new THREE.PlaneGeometry(longueur*2, largeur*2),
        new THREE.MeshBasicMaterial({map: enterPNG, transparent: true})
    )
    planeEnterBoom.name = "BoomBoomEscape"
    planeEnterBoom.rotateX(Math.PI * 0.5)
    planeEnterBoom.position.set(boomBoomEscape.position.x, boomBoomEscape.position.y-2, boomBoomEscape.position.z)


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
    var interactable = [gameTpBody, colormudarBody, fearOfDaemonBody, boomBoomEscapeBody, gameTpEnd]
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

    cameraHelper.init(camera, chassis, gRenderer.domElement, 0);    
    render();
})();

function updatePhysics() {
    gWorld.step(worldStep);
}

function render() { 
    updatePhysics();

    cameraHelper.update();

    if(vehicle.chassisBody.position.y <= -100){
        resetVehicle()
    }

    /**
     * Teleport Update
     */
    // gameTp.position.copy(gameTpBody.position)
    // gameTp.quaternion.copy(gameTpBody.quaternion)

    /**
     * Game Update
     */
    colormudarBody.quaternion.copy(colormudar.quaternion)
    planeEnterColor.quaternion.copy(colormudar.quaternion)
    fearOfDaemonBody.quaternion.copy(fearOfDaemon.quaternion)
    planeEnterFear.quaternion.copy(fearOfDaemon.quaternion)
    fearOfDaemonBody.position.copy(fearOfDaemon.position)
    boomBoomEscapeBody.quaternion.copy(boomBoomEscape.quaternion)
    planeEnterBoom.quaternion.copy(boomBoomEscape.quaternion)
    boomBoomEscapeBody.position.copy(boomBoomEscape.position)


        if(vehicle.chassisBody.position.x >= colormudarBody.position.x - (longueur) && vehicle.chassisBody.position.x <= colormudarBody.position.x + (longueur) && vehicle.chassisBody.position.z >= colormudarBody.position.z - (largeur) && vehicle.chassisBody.position.z <= colormudarBody.position.z + (largeur)){
            gScene.add(planeEnterColor)
            gsap.to(planeEnterColor.position, {duration: 0.2, y: colormudarBody.position.y+1})
            
        } else{
            if(gScene.getObjectByName("Colormudar")){
                gsap.to(planeEnterColor.position, {duration: 0.15, y: colormudarBody.position.y-2})
                setTimeout(function(){
                    gScene.remove(planeEnterColor)
                }, 150)
            }
        }
        
        if(vehicle.chassisBody.position.x >= fearOfDaemonBody.position.x - (longueur) && vehicle.chassisBody.position.x <= fearOfDaemonBody.position.x + (longueur) && vehicle.chassisBody.position.z >= fearOfDaemonBody.position.z - (largeur) && vehicle.chassisBody.position.z <= fearOfDaemonBody.position.z + (largeur)){
            gScene.add(planeEnterFear)
            gsap.to(planeEnterFear.position, {duration: 0.2, y: fearOfDaemonBody.position.y+1})
            
        } else{
            if(gScene.getObjectByName("FearOfDaemon")){
                gsap.to(planeEnterFear.position, {duration: 0.15, y: fearOfDaemonBody.position.y-2})
                setTimeout(function(){
                    gScene.remove(planeEnterFear)
                }, 150)
            }
        }
        
        if(vehicle.chassisBody.position.x >= boomBoomEscapeBody.position.x - (longueur) && vehicle.chassisBody.position.x <= boomBoomEscapeBody.position.x + (longueur) && vehicle.chassisBody.position.z >= boomBoomEscapeBody.position.z - (largeur) && vehicle.chassisBody.position.z <= boomBoomEscapeBody.position.z + (largeur)){
            gScene.add(planeEnterBoom)
            gsap.to(planeEnterBoom.position, {duration: 0.2, y: boomBoomEscapeBody.position.y+1})
            
        } else{
            if(gScene.getObjectByName("BoomBoomEscape")){
                gsap.to(planeEnterBoom.position, {duration: 0.15, y: boomBoomEscapeBody.position.y-2})
                setTimeout(function(){
                    gScene.remove(planeEnterBoom)
                }, 150)
            }
        }

    /**
     * Test update physique
     */
    // ballMesh.position.copy(ballBody.position)

    gRenderer.render(gScene, camera);

    requestAnimationFrame(render);
}

window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'V':
            resetVehicle(); 
            break;
        case 'ENTER':
            if(gScene.getObjectByName("Colormudar")){
                // window.location.pathname = "./immersions/mentions_legales.html"
                window.open("https://just-kiel.itch.io/colormudar")
            }
            if(gScene.getObjectByName("FearOfDaemon")){
                // window.location.pathname = "./immersions/mentions_legales.html"
                window.open("https://kangourou-gang.itch.io/fear-of-daemon")
            }
            if(gScene.getObjectByName("BoomBoomEscape")){
                // window.location.pathname = "./immersions/mentions_legales.html"
                window.open("https://valentin-prieto.itch.io/boom-boom-escape")
            }
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