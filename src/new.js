import './style/main.css'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from './utils.js';
import createVehicle from './raycastVehicle.js';
import {cameraHelper} from './cameraHelper.js';
import cannonDebugger from 'cannon-es-debugger'

import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

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
pointLight.position.set(50, 300, 150)
gScene.add(pointLight)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({color: '#4960A9'})
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
floor.position.z = 2
gScene.add(floor)

//Floor phys
const floorShape = new CANNON.Box(new CANNON.Vec3(200, 1, 200))
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
})
gWorld.addBody(floorBody)

//Axes Helper
const axesHelper = new THREE.AxesHelper(2)
gScene.add(axesHelper)

gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);
gWorld.gravity.set(0, -10, 0);
gWorld.defaultContactMaterial.friction = 1;

gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);

const vehicleInitialPosition = new THREE.Vector3(0, 15, -20);
// const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -Math.PI / 2);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
let resetVehicle = () => {};

var gameTp
var gameTpBody;

var pontGallery, pontGalleryBody

(async function init() {

    const [wheelGLTF, chassisGLTF, gameTpGLTF, pontGalleryGLTF] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        utils.loadResource('model/teleport_game.gltf'),
        utils.loadResource('model/Pont.gltf'),
    ]);

    const wheel = wheelGLTF.scene;
    const chassis = chassisGLTF.scene;
    
    gameTp = gameTpGLTF.scene;

    gameTp.position.set(7, 1.8, 12)
    gameTp.scale.set(11, 11, 11)

    gScene.add(gameTp)

    // Pont vers la galerie
    pontGallery = pontGalleryGLTF.scene
    pontGallery.scale.set(3.3, 3.3, 3.3)
    pontGallery.rotation.set(0, - Math.PI*0.3, 0)
    pontGallery.position.set(-295, 1, 255)
    gScene.add(pontGallery)

    const bridgeShape = new CANNON.Box(new CANNON.Vec3(22, 1, 140))
    pontGalleryBody = new CANNON.Body({
        mass: 0,
        shape: bridgeShape,
        position: new CANNON.Vec3(-295, 1, 255) ,
        quaternion: new CANNON.Quaternion(0, -0.43, 0)
    })
    gWorld.addBody(pontGalleryBody)

    // Collider vers galerie
    const collideShape = new CANNON.Box(new CANNON.Vec3(22, 10, 50))
    const collideGallery = new CANNON.Body({
        mass:1000,
        shape: collideShape,
        position: new CANNON.Vec3(-295, 15, 255),
        quaternion: new CANNON.Quaternion(0, -0.47, 0)
    })
    gWorld.addBody(collideGallery)

    // Teleport Game phys
    const gameTpShape = new CANNON.Box(new CANNON.Vec3(11, 11, 11))
    gameTpBody = new CANNON.Body({
        mass: 1000,
        position: new CANNON.Vec3(100, 22, 150),
        shape: gameTpShape,
        quaternion: new CANNON.Quaternion(1, 0, -0.5)
    })
    gWorld.addBody(gameTpBody)

    setMaterials(wheel, chassis);
    chassis.scale.set(2, 2, 2);
    wheel.scale.set(1.2, 1.2, 1.2)

    const meshes = {
        wheel_front_r: wheel,
        wheel_front_l: wheel.clone(),
        wheel_rear_r: wheel.clone(),
        wheel_rear_l: wheel.clone(),
        chassis,
    };

    const vehicle = createVehicle(gameTpBody);
    vehicle.addToWorld(gWorld, meshes);
    var interactable = [gameTpBody, collideGallery]
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
    stats.begin()

    if (pause) {
        return;
    }

    
    updatePhysics();

    if (wireframeRenderer) {
        wireframeRenderer.update();
    }

    cameraHelper.update();

    gameTp.position.copy(gameTpBody.position)
    gameTp.quaternion.copy(gameTpBody.quaternion)

    gRenderer.render(gScene, camera);

    requestAnimationFrame(render);
    stats.end()
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
