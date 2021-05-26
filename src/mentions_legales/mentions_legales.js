import '../style/main.css'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from '../utils.js';
import createVehicle from '../raycastVehicle.js';
import {cameraHelper} from '../cameraHelper.js';
// import cannonDebugger from 'cannon-es-debugger'

const worldStep = 1/60;

const gWorld = new CANNON.World();
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

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)

camera.position.y = 3
camera.position.z = -10
gScene.add(camera)

let wireframeRenderer = null;
let pause = false;


const ambientLight = new THREE.AmbientLight('#706F6F', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 800)
pointLight.position.set(50, 1000, -150)
gScene.add(pointLight)

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

gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);
gWorld.gravity.set(0, -10, 0);
gWorld.defaultContactMaterial.friction = 1;

gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);

const vehicleInitialPosition = new THREE.Vector3(-10, 25, -10);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI *0.50);
let resetVehicle = () => {};

const mouse = new THREE.Vector2();

var vehicle, chassis

const mentions = [40, 30, 150];
var plane1, plane2, plane3, plane4, plane5;
const hauteurOeuvre = 70;
const ecartOeuvre = 155;


(async function init() {

    const [wheelGLTF, chassisGLTF] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
    ]);

    const collideShape = new CANNON.Box(new CANNON.Vec3(50, 10, 22))
    const collideBehind = new CANNON.Body({
        mass:1000,
        shape: collideShape,
        position: new CANNON.Vec3(50, 15,0)
    })
    gWorld.addBody(collideBehind)
    const collideFront = new CANNON.Body({
        mass:1000,
        shape: collideShape,
        position: new CANNON.Vec3(-950, 15,0)
    })
    gWorld.addBody(collideFront)


    // Plane Mentions Légales
    const oeuvreGeometry = new THREE.PlaneGeometry(152, 88)
    plane1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    plane1.rotation.y = Math.PI
    plane1.position.set(mentions[0]-ecartOeuvre, hauteurOeuvre, mentions[2])
    
    plane2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    plane2.rotation.y = Math.PI
    plane2.position.set(mentions[0]-(ecartOeuvre*2), hauteurOeuvre, mentions[2])
   
    plane3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    plane3.rotation.y = Math.PI
    plane3.position.set(mentions[0]-(ecartOeuvre*3), hauteurOeuvre, mentions[2])
    
    plane4 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    plane4.rotation.y = Math.PI
    plane4.position.set(mentions[0]-(ecartOeuvre*4), hauteurOeuvre, mentions[2])
    
    plane5 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    plane5.rotation.y = Math.PI
    plane5.position.set(mentions[0]-(ecartOeuvre*5), hauteurOeuvre, mentions[2])
    gScene.add(plane1, plane2, plane3, plane4, plane5)

    const wheel = wheelGLTF.scene;
    chassis = chassisGLTF.scene;

    //setMaterials(wheel, chassis);
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
            console.log("g fin")
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

    if (wireframeRenderer) {
        wireframeRenderer.update();
    }
}


    cameraHelper.update();

    gRenderer.render(gScene, camera);

    requestAnimationFrame(render);
}

function getAspectRatio() {
    return window.innerWidth / window.innerHeight;
}

function windowResizeHandler() {
    camera.aspect = getAspectRatio();
    camera.updateProjectionMatrix();
    gRenderer.setSize(window.innerWidth, window.innerHeight);
}

window.onresize = utils.debounce(windowResizeHandler, 500);


window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'V':
            resetVehicle();
            break;
    }
});