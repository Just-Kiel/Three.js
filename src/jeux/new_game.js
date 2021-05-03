import '../style/main.css'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from '../utils.js';
import createVehicle from '../raycastVehicle.js';
import {cameraHelper} from '../cameraHelper.js';
import cannonDebugger from 'cannon-es-debugger'


const worldStep = 1/60;

const gWorld = new CANNON.World();
const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer(/*{antialias: true}*/{
    canvas: document.querySelector('.webgl')
});
const gCamera = new THREE.PerspectiveCamera(90, getAspectRatio(), 0.1, 1000);

cannonDebugger(gScene, gWorld.bodies, {color: "red"})

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

const ambientLight = new THREE.AmbientLight('#686868', 1);
gScene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 1000)
pointLight.position.set(50, 100, 150)
gScene.add(pointLight)

// Ball fun
const ballGeometry = new THREE.SphereGeometry(5, 32, 32)
const ballMaterial = new THREE.MeshBasicMaterial({color: 0xff0000})
const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial)
gScene.add(ballMesh)

// Ball phys
const ballShape = new CANNON.Sphere(5)
const ballBody = new CANNON.Body({mass: 1, shape: ballShape, position: new CANNON.Vec3(-15, 15, 8)})
gWorld.addBody(ballBody)

//Floor phys
const floorShape = new CANNON.Cylinder(115, 1, 30)
const floorBody1 = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(0, -15, 0)
})
const floorBody2 = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(0, -14.4, 390),
    quaternion: new CANNON.Quaternion(-0.005, 0, 0.005)
})
const floorBody3 = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(340, -45.4, 630),
    quaternion: new CANNON.Quaternion(-0.005, 0, 0.005)
})
//floorBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 1), Math.PI * 0.004)
gWorld.addBody(floorBody1)
gWorld.addBody(floorBody2)
gWorld.addBody(floorBody3)

const bridgeShape1 = new CANNON.Box(new CANNON.Vec3(20, 1, 110))
const floorBodyBridge1 = new CANNON.Body({
    mass: 0,
    shape: bridgeShape1,
    position: new CANNON.Vec3(0, -1, 200)
})
gWorld.addBody(floorBodyBridge1)

const bridgeShape2 = new CANNON.Box(new CANNON.Vec3(20, 3, 110))
const floorBodyBridge2 = new CANNON.Body({
    mass: 0,
    shape: bridgeShape2,
    position: new CANNON.Vec3(179, -18.2, 504),
    quaternion: new CANNON.Quaternion(0.088, 0.4, -0.015)
})
// floorBodyBridge2.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI * 1.2)
// floorBodyBridge2.quaternion.set(0,Math.PI * 0.6,Math.PI * 0.6)
gWorld.addBody(floorBodyBridge2)


// //Axes Helper
// const axesHelper = new THREE.AxesHzselper(2)
// gScene.add(axesHelper)

gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);
gWorld.gravity.set(0, -10, 0);
gWorld.defaultContactMaterial.friction = 0;

gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);

const vehicleInitialPosition = new THREE.Vector3(0, 15, -2);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -Math.PI / 2);
let resetVehicle = () => {};

var gameTp
var gameTpBody

var island

(async function init() {

    const [wheelGLTF, chassisGLTF, gameTpGLTF, islandGLTF] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        utils.loadResource('model/teleport_game.gltf'),
        utils.loadResource('model/Floating_island_all.gltf')
    ]);

    const wheel = wheelGLTF.scene;
    const chassis = chassisGLTF.scene;
    gameTp = gameTpGLTF.scene;
    island = islandGLTF.scene.children[0]

    gameTp.position.set(7, 1.8, 12)
    gameTp.scale.set(1.7, 1.7, 1.7)
    gameTp.rotation.set(Math.PI/2, 0, -Math.PI/4)

    gScene.add(gameTp)


    island.position.set(0, -62.5, 0)
    console.log(island)
    // var islandShape = []
    // var islandBody = []
    // for(var i = 0; i< island.children.length; i++){
    //     islandShape[i] = CreateTrimesh(island.children[i].geometry)
    //     console.log(island.children[i])

    //     // islandBody[i] = new CANNON.Body({mass: 0})
    //     // islandBody[i].addShape(islandShape[i])
    //     // console.log(islandBody[i])
    //     //gWorld.addBody(islandBody[i])
    //     // console.log(islandBody)
    // }

    gScene.add(island)

    

    // Teleport Game phys
    const gameTpShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5))
    gameTpBody = new CANNON.Body({
        mass: 1000,
        position: new CANNON.Vec3(7, 1.8, 12),
        shape: gameTpShape
    })
    gWorld.addBody(gameTpBody)

    setMaterials(wheel, chassis);
    chassis.scale.set(0.5, 0.5, 0.5);
    wheel.scale.set(0.3, 0.3, 0.3)

    const meshes = {
        wheel_front_r: wheel,
        wheel_front_l: wheel.clone(),
        wheel_rear_r: wheel.clone(),
        wheel_rear_l: wheel.clone(),
        chassis,
    };

    const vehicle = createVehicle(gameTpBody);
    vehicle.addToWorld(gWorld, meshes);

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

    cameraHelper.init(camera, chassis, gRenderer.domElement);
    //cameraHelper.init(camera, ballMesh, gRenderer.domElement);

    console.log(ballMesh.position)
    
    render();
})();

function updatePhysics() {
    gWorld.step(worldStep);
}

function render() {
    if (pause) {
        return;
    }

    
    updatePhysics();

    if (wireframeRenderer) {
        wireframeRenderer.update();
    }

    cameraHelper.update();

    gameTp.position.copy(gameTpBody.position)

    ballMesh.position.copy(ballBody.position)

    gRenderer.render(gScene, camera);

    requestAnimationFrame(render);
}

function setMaterials(wheel, chassis) {
    const baseMaterial = new THREE.MeshLambertMaterial({color: 0x111111});
    const fenderMaterial = new THREE.MeshBasicMaterial({color: 0x050505});
    const grillMaterial = new THREE.MeshBasicMaterial({color: 0x222222});
    const chromeMaterial = new THREE.MeshPhongMaterial({color: 0xCCCCCC});
    const glassMaterial = new THREE.MeshPhongMaterial({color: 0x1155FF});
    const tailLightMaterial = new THREE.MeshPhongMaterial({color: 0x550000});
    const headLightMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFBB});
    const wheelMaterial = new THREE.MeshBasicMaterial();
    wheelMaterial.alphaTest = 0.5;
    wheelMaterial.skinning = true;
    
    wheel.traverse((childMesh) => {
        if (childMesh.material) {
            wheelMaterial.map = childMesh.material.map;

            childMesh.material = wheelMaterial;
            childMesh.material.needsUpdate = true;
        }
    });

    chassis.traverse((childMesh) => {
        if (childMesh.material) {
            childMesh.material = getChassisMaterialByPartName(childMesh.name);
        }
    });

    function getChassisMaterialByPartName(partName) {
        switch (partName) {
            case 'front_bumper':
            case 'rear_bumper':
            case 'front_fender':
            case 'rear_fender':
                return fenderMaterial;
            case 'grill':
                return grillMaterial;
            case 'brushGuard':
                return chromeMaterial;
            case 'glass':
                return glassMaterial;
            case 'tail_lights':
                return tailLightMaterial;
            case 'head_lights':
                return headLightMaterial;
            default:
                return baseMaterial;
        };
    }
}

function getAspectRatio() {
    return window.innerWidth / window.innerHeight;
}

function windowResizeHandler() {
    gCamera.aspect = getAspectRatio();
    gCamera.updateProjectionMatrix();
    gRenderer.setSize(window.innerWidth, window.innerHeight);
}

window.onresize = utils.debounce(windowResizeHandler, 500);

const instructionsContainer = document.getElementById('instructions-container');
const instructionsCloseButton = document.getElementById('instructions-close-button');
const resolutionController = document.getElementById('resolution-controller');
const wireframeToggleButton = document.getElementById('wireframe-toggle-button');

window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'C':
            //cameraHelper.switch();
            break;
        case 'P':
            pause = !pause;
            if (pause) {
                console.info('Pause');
            } else {
                render();
            }
            break;
        case 'R':
            ballBody.position.set(-4, 5, 8)
            break;
        case 'V':
            resetVehicle(); 
            break;
        case 'ESCAPE':
            instructionsContainer.classList.toggle('hidden');
            break;
    }
});

// instructionsCloseButton.addEventListener('click', () => {
//     instructionsContainer.classList.add('hidden');
// });

// instructionsContainer.addEventListener('mousedown', (e) => {
//     console.log('instructions mousedown');
//     e.stopImmediatePropagation;
//     e.stopPropagation;
// });

// wireframeToggleButton.addEventListener('click', () => {   
//     if (wireframeRenderer) {
//         wireframeRenderer._meshes.forEach(mesh => gScene.remove(mesh));
//         wireframeRenderer._meshes = [];
//         wireframeRenderer = null;
//     } else {
//         wireframeRenderer = gCannonDebugRenderer;
//     }
// });
function CreateTrimesh(geometry) {
    const vertices = geometry.attributes.position.array;
    const indices = Object.keys(vertices).map(Number);
    return new CANNON.Trimesh(vertices, indices);
}

(function initResolutionController() {
    const maxWidth = window.screen.availWidth;
    const maxHeight = window.screen.availHeight;

    [1/1, 3/4, 1/2, 1/4].forEach(ratio => {
        const option = document.createElement('option');
        option.value = ratio;
        option.innerText = `${Math.floor(maxWidth * ratio)} x ${Math.floor(maxHeight * ratio)}`;

        //resolutionController.appendChild(option);
    });

    //resolutionController.addEventListener('change', (e) => gRenderer.setPixelRatio(e.currentTarget.value));
})();
