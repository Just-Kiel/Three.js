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



const clock = new THREE.Clock()

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

// const personControls = new FirstPersonControls(camera, gRenderer.domElement)
// personControls.movementSpeed = 150
// personControls.lookSpeed = 0.1

let wireframeRenderer = null;
let pause = false;


const ambientLight = new THREE.AmbientLight('#686868', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 1000)
pointLight.position.set(50, 300, 150)
gScene.add(pointLight)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 600),
    new THREE.MeshStandardMaterial({color: '#4960A9'})
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
floor.position.z = 2
gScene.add(floor)

// Floor phys
const floorShape = new CANNON.Box(new CANNON.Vec3(1000, 1, 100))
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
})
gWorld.addBody(floorBody)

// //Axes Helper
// const axesHelper = new THREE.AxesHelper(2)
// gScene.add(axesHelper)

gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);
gWorld.gravity.set(0, -10, 0);
gWorld.defaultContactMaterial.friction = 1;

gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);

const vehicleInitialPosition = new THREE.Vector3(180, 15, 0);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
let resetVehicle = () => {};

var raycaster

(async function init() {

    const [wheelGLTF, chassisGLTF, manropeJSON] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        utils.loadResource('fonts/Manrope_Bold.json')
    ]);

    // Texte
    const textGalleryGeometry = new THREE.TextGeometry(
        'Galerie',
        {
            font: manropeJSON,
            size: 15,
            height: 4,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        }
    )
    const textGalleryMaterial = new THREE.MeshBasicMaterial()
    const textGallery = new THREE.Mesh(textGalleryGeometry, textGalleryMaterial)
    textGallery.rotation.y = -Math.PI*1.5
    textGallery.position.set(50, 0, 100)

    const textGallery2Geometry = new THREE.TextGeometry(
        'des Nominé.e.s',
        {
            font: manropeJSON,
            size: 15,
            height: 4,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        }
    )
    const textGallery2 = new THREE.Mesh(textGallery2Geometry, textGalleryMaterial)
    textGallery2.rotation.y = Math.PI/2
    textGallery2.position.set(50, 0, -20)
    gScene.add(textGallery, textGallery2)

    // Oeuvres flottantes
    const oeuvreGeometry = new THREE.PlaneGeometry(152, 88)
    const oeuvre1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    oeuvre1.rotation.y = Math.PI * 0.5
    oeuvre1.position.set(0, 70, 0)
    gScene.add(oeuvre1)


    // Raycaster
    raycaster = new THREE.Raycaster()
    const rayOrigin = new THREE.Vector3(100, 5, 0)
    const rayDirection = new THREE.Vector3(-2000, 0, 0)
    
    // raycaster.set()

    const wheel = wheelGLTF.scene;
    const chassis = chassisGLTF.scene;

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

    const vehicle = createVehicle();
    vehicle.addToWorld(gWorld, meshes);
    // var interactable = [gameTpBody, collideGallery]
    // vehicle.detectBody(interactable)

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

    cameraHelper.init(camera, chassis, gRenderer.domElement, 2);
    
    render();
})();

function updatePhysics() {
    gWorld.step(worldStep);
}

function render() {

    if (pause) {
        return;
    }

    // personControls.update(clock.getDelta())
    
    updatePhysics();

    if (wireframeRenderer) {
        wireframeRenderer.update();
    }

    cameraHelper.update();

    gRenderer.render(gScene, camera);

    requestAnimationFrame(render);
}

// function setMaterials(wheel, chassis) {
//     const baseMaterial = new THREE.MeshLambertMaterial({color: 0x111111});
//     const fenderMaterial = new THREE.MeshBasicMaterial({color: 0x050505});
//     const grillMaterial = new THREE.MeshBasicMaterial({color: 0x222222});
//     const chromeMaterial = new THREE.MeshPhongMaterial({color: 0xCCCCCC});
//     const glassMaterial = new THREE.MeshPhongMaterial({color: 0x1155FF});
//     const tailLightMaterial = new THREE.MeshPhongMaterial({color: 0x550000});
//     const headLightMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFBB});
//     const wheelMaterial = new THREE.MeshBasicMaterial();
//     wheelMaterial.alphaTest = 0.5;
//     wheelMaterial.skinning = true;
    
//     wheel.traverse((childMesh) => {
//         if (childMesh.material) {
//             wheelMaterial.map = childMesh.material.map;

//             childMesh.material = wheelMaterial;
//             childMesh.material.needsUpdate = true;
//         }
//     });

//     chassis.traverse((childMesh) => {
//         if (childMesh.material) {
//             childMesh.material = getChassisMaterialByPartName(childMesh.name);
//         }
//     });

//     function getChassisMaterialByPartName(partName) {
//         switch (partName) {
//             case 'front_bumper':
//             case 'rear_bumper':
//             case 'front_fender':
//             case 'rear_fender':
//                 return fenderMaterial;
//             case 'grill':
//                 return grillMaterial;
//             case 'brushGuard':
//                 return chromeMaterial;
//             case 'glass':
//                 return glassMaterial;
//             case 'tail_lights':
//                 return tailLightMaterial;
//             case 'head_lights':
//                 return headLightMaterial;
//             default:
//                 return baseMaterial;
//         };
//     }
// }

function getAspectRatio() {
    return window.innerWidth / window.innerHeight;
}

function windowResizeHandler() {
    camera.aspect = getAspectRatio();
    camera.updateProjectionMatrix();
    gRenderer.setSize(window.innerWidth, window.innerHeight);
    // personControls.handleResize()
}

window.onresize = utils.debounce(windowResizeHandler, 500);

const instructionsContainer = document.getElementById('instructions-container');

window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'C':
            // cameraHelper.switch();
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

// (function initResolutionController() {
//     const maxWidth = window.screen.availWidth;
//     const maxHeight = window.screen.availHeight;

//     [1/1, 3/4, 1/2, 1/4].forEach(ratio => {
//         const option = document.createElement('option');
//         option.value = ratio;
//         option.innerText = `${Math.floor(maxWidth * ratio)} x ${Math.floor(maxHeight * ratio)}`;

//         //resolutionController.appendChild(option);
//     });

//     //resolutionController.addEventListener('change', (e) => gRenderer.setPixelRatio(e.currentTarget.value));
// })();