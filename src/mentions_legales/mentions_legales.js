import '../style/main.scss'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from '../utils.js';
import createVehicle from '../raycastVehicle.js';
import {cameraHelper} from '../cameraHelper.js';
// import cannonDebugger from 'cannon-es-debugger'
import '../menu.js'

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
const ambientLight = new THREE.AmbientLight('#706F6F', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 800)
pointLight.position.set(50, 1000, -150)
gScene.add(pointLight)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(6000, 600),
    new THREE.MeshStandardMaterial({color: '#D9AE71'})
)
floor.rotation.x = - Math.PI * 0.5
floor.position.set(-2700, 0, 2)
gScene.add(floor)

// Floor phys
const floorShape = new CANNON.Box(new CANNON.Vec3(3000, 1, 100))
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(-2700, 0, 2)
})
gWorld.addBody(floorBody)


var vehicle, chassis
const vehicleInitialPosition = new THREE.Vector3(50, 25, -10);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI *0.50);
let resetVehicle = () => {};


const mouse = new THREE.Vector2();

const mentions = [40, 30, 50];
var planes = []
var textures = []
var objJSON;
const hauteurOeuvre = 50;
const ecartOeuvre = 155;

(async function init() {

    const [wheelGLTF, chassisGLTF,fileJSON] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        utils.loadResource('infos/mentions.txt'),
    ]);

    


    /**
     * Affichage Mentions légales
     */
    objJSON = JSON.parse(fileJSON)
    const oeuvreGeometry = new THREE.PlaneGeometry(152, 88)
    for(var mention in objJSON.mentions){
        for(var texture in objJSON.mentions[mention]){
            textures[mention] = await Promise.all([
                utils.loadResource(objJSON.mentions[mention][texture])
            ]);
            planes[mention] = new THREE.Mesh(
                oeuvreGeometry,
                new THREE.MeshBasicMaterial({transparent: true, map: textures[mention][0]})
            )
            planes[mention].rotation.y = Math.PI
            planes[mention].position.set(mentions[0]-(ecartOeuvre*mention), hauteurOeuvre, mentions[2])
            gScene.add(planes[mention])
        }
    }

    console.log(planes.length)

    /**
     * Colliders Mentions légales
     */
     const collideShape = new CANNON.Box(new CANNON.Vec3(50, 10, 22))
     const collideBehind = new CANNON.Body({
         mass:0,
         shape: collideShape,
         position: new CANNON.Vec3(150, 0,0)
     })
     gWorld.addBody(collideBehind)
     const collideFront = new CANNON.Body({
         mass:0,
         shape: collideShape,
         position: new CANNON.Vec3(-(planes.length*ecartOeuvre), 0,0)
     })
     collideFront.collisionResponse = 0
     gWorld.addBody(collideFront)


    /**
     * Van
     */
    const wheel = wheelGLTF.scene;
    chassis = chassisGLTF.scene;

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
    var interactable = [collideFront]
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

    cameraHelper.init(camera, chassis, gRenderer.domElement, 4);
    
    render();
})();

function updatePhysics() {
    gWorld.step(worldStep);
}

let currentIntersect = null

/**
 * Curseur de souris
 */
let mouseCursor = document.querySelector("#cursor")
window.addEventListener( 'mousemove', onMouseMove, false );
function onMouseMove(event){
    mouseCursor.style.top = event.clientY + "px"
    mouseCursor.style.left = event.clientX + "px"
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) *2 +1;
}

window.addEventListener('click', () => {
    if(document.getElementById("cursor").classList.contains('cross')){
        document.getElementById("cursor").classList.remove("cross")
        cameraHelper.init(camera, chassis, gRenderer.domElement, 2);
    } else
    if(currentIntersect){
        console.log('clicliclic')
        document.getElementById("cursor").classList.add("cross")
        if(chassis != undefined){
            cameraHelper.switch(currentIntersect, chassis)
        }
    }
    
})

function render() {
    if(document.getElementById("load").classList.contains("hidden")){
        if(chassis != undefined){
            pointLight.position.x = chassis.position.x
        }
        updatePhysics();
    }

    cameraHelper.update();
    gRenderer.render(gScene, camera);
    requestAnimationFrame(render);
}

window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'V':
            resetVehicle();
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