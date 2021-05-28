import '../style/main.css'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from '../utils.js';
import createVehicle from '../raycastVehicle.js';
import {cameraHelper} from '../cameraHelper.js';
// import cannonDebugger from 'cannon-es-debugger';
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'


const worldStep = 1/60;

const gWorld = new CANNON.World();
const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer(/*{antialias: true}*/{
    canvas: document.querySelector('.webgl'),
    powerPreference: 'high-performance'
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

 // EffectComposer
 const effectComposer = new EffectComposer(gRenderer)
 effectComposer.setSize(sizes.width, sizes.height)
 effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
 const renderPass = new RenderPass(gScene, camera)
 effectComposer.addPass(renderPass)
 // Antialiasing
 const smaaPass = new SMAAPass()
 effectComposer.addPass(smaaPass)

//  // BloomPass
//  const unrealBloomPass = new UnrealBloomPass()
//  unrealBloomPass.enabled = true
//  unrealBloomPass.strength = 0.35
//  unrealBloomPass.radius = 0
//  unrealBloomPass.threshold = 0.15
//  unrealBloomPass.renderToScreen = true
//  effectComposer.addPass(unrealBloomPass)

let wireframeRenderer = null;
let pause = false;

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#706F6F', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 800)
pointLight.position.set(50, 1000, 150)
gScene.add(pointLight)
const horizonLight = new THREE.PointLight(0xffffff, 6, 2000)
gScene.add(horizonLight)
const spot1 = new THREE.PointLight('#0DC6FD', 1, 200)
spot1.position.set(-200, 0, -100)
const spot2 = new THREE.PointLight('#0DC6FD', 1, 200)
spot2.position.set(-500, 0, 100)
const spot3 = new THREE.PointLight('#0DC6FD', 1, 200)
spot3.position.set(-800, 0, -100)
const spot4 = new THREE.PointLight('#0DC6FD', 1, 200)
spot4.position.set(-1100, 0, 100)
const spot5 = new THREE.PointLight('#0DC6FD', 1, 200)
spot5.position.set(-1400, 0, -100)
const spot6 = new THREE.PointLight('#0DC6FD', 1, 200)
spot6.position.set(-1700, 0, 100)
const spot7 = new THREE.PointLight('#0DC6FD', 1, 200)
spot7.position.set(-2000, 0, -100)
const spot8 = new THREE.PointLight('#0DC6FD', 1, 200)
spot8.position.set(-2300, 0, 100)
const spot9 = new THREE.PointLight('#0DC6FD', 1, 200)
spot9.position.set(-2600, 0, -100)
const spot10 = new THREE.PointLight('#0DC6FD', 1, 200)
spot10.position.set(-2900, 0, 100)
const spot11 = new THREE.PointLight('#0DC6FD', 1, 200)
spot11.position.set(-3200, 0, -100)
const spot12 = new THREE.PointLight('#0DC6FD', 1, 200)
spot12.position.set(-3500, 0, 100)
const spot13 = new THREE.PointLight('#0DC6FD', 1, 200)
spot13.position.set(-3800, 0, -100)
const spot14 = new THREE.PointLight('#0DC6FD', 1, 200)
spot14.position.set(-4100, 0, 100)
const spot15 = new THREE.PointLight('#0DC6FD', 1, 200)
spot15.position.set(-4400, 0, -100)
const spot16 = new THREE.PointLight('#0DC6FD', 1, 200)
spot16.position.set(-4700, 0, 100)
const spot17 = new THREE.PointLight('#0DC6FD', 1, 200)
spot17.position.set(-5000, 0, -100)
const spot18 = new THREE.PointLight('#0DC6FD', 1, 200)
spot18.position.set(-5300, 0, 100)
const spot19 = new THREE.PointLight('#0DC6FD', 1, 200)
spot19.position.set(-5600, 0, -100)
const spot20 = new THREE.PointLight('#0DC6FD', 1, 200)
spot20.position.set(-5900, 0, 100)
const spot21 = new THREE.PointLight('#0DC6FD', 1, 200)
spot21.position.set(-6200, 0, -100)
// const spot22 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot22.position.set(-6500, 0, 100)
// const spot23 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot23.position.set(-6800, 0, -100)
// const spot24 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot24.position.set(-00, 0, 100)
gScene.add(spot1, spot2, spot3, spot4, spot5, spot6, spot7, spot8, spot9, spot10, spot11, spot12, spot13, spot14, spot15, spot16, spot17, spot18, spot19, spot20, spot21)

const floorMaterial = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms:
    {
        uTime: {value: 0},
        u_resolution: {value : new THREE.Vector2(sizes.height, sizes.width)}
    }
})

// Floor phys
const floorShape = new CANNON.Box(new CANNON.Vec3(3200, 1, 100))
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(-2700, 0, 2)
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

const vehicleInitialPosition = new THREE.Vector3(180, 25, 2.5);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI *0.50);
let resetVehicle = () => {};

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2();

var vehicle, chassis

const multimedia = [40, 37, 0];
var oeuvre1, oeuvre2, oeuvre3;
const hauteurOeuvre = 70;
const ecartOeuvre = 225;
const communication = [multimedia[0]-(ecartOeuvre*4), multimedia[1], multimedia[2]];
var oeuvreCom1, oeuvreCom2, oeuvreCom3;
const infographie = [communication[0]-(ecartOeuvre*4), communication[1], communication[2]];
var oeuvreInfo1, oeuvreInfo2, oeuvreInfo3;
const audiovisuel = [infographie[0]-(ecartOeuvre*4), infographie[1], infographie[2]];
var oeuvreAudio1, oeuvreAudio2, oeuvreAudio3;
const web = [audiovisuel[0]-(ecartOeuvre*4), audiovisuel[1], audiovisuel[2]];
var oeuvreWeb1, oeuvreWeb2, oeuvreWeb3;
const animation = [web[0]-(ecartOeuvre*4), web[1], web[2]];
var oeuvreAnim1, oeuvreAnim2, oeuvreAnim3;
var pontTron, pontTronBody;
var horizonGalerie;
var positionHorizon = -6500;
var boutHorizon = [];

(async function init() {

    const [wheelGLTF, chassisGLTF, hansonJSON, pontTronGLTF, horizonGLTF] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        utils.loadResource('fonts/Hanson_Bold.json'),
        utils.loadResource('model/Pont.gltf'),
        utils.loadResource('model/horizon_galerie.gltf')
    ]);

    // Sol

    // floorMaskMaterial.alphaMap.magFilter = THREE.NearestFilter;
    // floorMaskMaterial.alphaMap.wrapT = THREE.RepeatWrapping;
    // floorMaskMaterial.alphaMap.repeat.y = 1;

    // const fog = new THREE.Fog('#0DC6FD', 15, 120)
    // gScene.fog = fog
    
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(6000, 600),
        floorMaterial
    )
    floor.rotation.x = - Math.PI * 0.5
    floor.position.set(-2700, 0, 2)
    
    const floorSecond = new THREE.Mesh(
        new THREE.PlaneGeometry(6000, 600),
        floorMaterial
    )
    floorSecond.rotation.x = - Math.PI * 0.5
    floorSecond.position.set(-8900, 0, 2)

    const mur = new THREE.Mesh(
        new THREE.PlaneGeometry(6000, 600),
        new THREE.MeshStandardMaterial({color: '#000000'})
    )
    mur.rotation.y = Math.PI * 0.5
    mur.position.set(-6000, -301, 2)
    
    gScene.add(floor, floorSecond, mur)

    horizonGalerie = horizonGLTF.scene
    horizonGalerie.scale.set(15, 15, 15)
    horizonGalerie.rotation.set(0, Math.PI*0.5, 0)

    // boutHorizon[0] = horizonGLTF.scene.children[5]
    // boutHorizon[0].scale.set(12, 12, 12)
    // boutHorizon[0].position.set(-200, 12, 150)
    // boutHorizon[0].rotation.set(0, Math.PI*0.5, 0)

    // boutHorizon[1] = horizonGLTF.scene.children[1]
    // boutHorizon[1].scale.set(12, 12, 12)
    // boutHorizon[1].position.set(-450, 9, -150)
    // boutHorizon[1].rotation.set(0, Math.PI*0.5, Math.PI*0.4)
    
    // boutHorizon[2] = horizonGLTF.scene.children[0]
    // boutHorizon[2].scale.set(8, 8, 8)
    // boutHorizon[2].position.set(-900, 9, 150)
    // boutHorizon[2].rotation.set(Math.PI*0.5, 0, Math.PI*0.5)


    // console.log(horizonGLTF.scene)
    gScene.add(horizonGalerie)

    // Pont retour vers Hub
    pontTron = pontTronGLTF.scene
    pontTron.scale.set(3.3, 3.3, 3.3)
    pontTron.rotation.set(0, -Math.PI*0.5, 0)
    pontTron.position.set(-5800,1,0)
    gScene.add(pontTron)

    // Collider vers hub
    const collideShape = new CANNON.Box(new CANNON.Vec3(10, 10, 20))
    const collideHub = new CANNON.Body({
        mass:1000,
        shape: collideShape,
        position: new CANNON.Vec3(-5850, 15,0),
        // quaternion: new CANNON.Quaternion(0, -0.47, 0)
    })
    const collideBehind = new CANNON.Body({
        mass:1000,
        shape: collideShape,
        position: new CANNON.Vec3(250, 15,0),
        // quaternion: new CANNON.Quaternion(0, -0.47, 0)
    })
    gWorld.addBody(collideHub)
    gWorld.addBody(collideBehind)

    // Texte
    const textGalleryGeometry = new THREE.TextGeometry(
        'galerie',
        {
            font: hansonJSON,
            size: 15,
            height: 3,
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
    textGallery.position.set(50, 7, 125)

    const textGallery2Geometry = new THREE.TextGeometry(
        'des nominés',
        {
            font: hansonJSON,
            size: 15,
            height: 3,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        }
    )
    const textGallery2 = new THREE.Mesh(textGallery2Geometry, textGalleryMaterial)
    textGallery2.rotation.y = Math.PI/2 * 1.1
    textGallery2.position.set(50, 7, -20)
    gScene.add(textGallery, textGallery2)

    const textMultimediaGeometry = new THREE.TextGeometry(
        'multimédia',
        {
            font: hansonJSON,
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
    const textMultimedia = new THREE.Mesh(textMultimediaGeometry, textGalleryMaterial)
    textMultimedia.rotation.y = Math.PI/2
    textMultimediaGeometry.center()
    textMultimedia.position.set(multimedia[0], multimedia[1], multimedia[2])
    
    const textCommunicationGeometry = new THREE.TextGeometry(
        'communication',
        {
            font: hansonJSON,
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
    const textCommunication = new THREE.Mesh(textCommunicationGeometry, textGalleryMaterial)
    textCommunication.rotation.y = Math.PI/2
    textCommunicationGeometry.center()
    textCommunication.position.set(communication[0], communication[1], communication[2])

    const textInfoGeometry = new THREE.TextGeometry(
        'infographie',
        {
            font: hansonJSON,
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
    const textInfo = new THREE.Mesh(textInfoGeometry, textGalleryMaterial)
    textInfo.rotation.y = Math.PI/2
    textInfoGeometry.center()
    textInfo.position.set(infographie[0], infographie[1], infographie[2])
    
    const textAudioGeometry = new THREE.TextGeometry(
        'audiovisuel',
        {
            font: hansonJSON,
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
    const textAudio = new THREE.Mesh(textAudioGeometry, textGalleryMaterial)
    textAudio.rotation.y = Math.PI/2
    textAudioGeometry.center()
    textAudio.position.set(audiovisuel[0], audiovisuel[1], audiovisuel[2])
    
    const textWebGeometry = new THREE.TextGeometry(
        'site web',
        {
            font: hansonJSON,
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
    const textWeb = new THREE.Mesh(textWebGeometry, textGalleryMaterial)
    textWeb.rotation.y = Math.PI/2
    textWebGeometry.center()
    textWeb.position.set(web[0], web[1], web[2])
    
    const textAnimGeometry = new THREE.TextGeometry(
        'animation',
        {
            font: hansonJSON,
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
    const textAnim = new THREE.Mesh(textAnimGeometry, textGalleryMaterial)
    textAnim.rotation.y = Math.PI/2
    textAnimGeometry.center()
    textAnim.position.set(animation[0], animation[1], animation[2])


    gScene.add(textMultimedia, textCommunication, textInfo, textAudio, textWeb, textAnim)

    // Oeuvres flottantes Multimedia
    const oeuvreGeometry = new THREE.PlaneGeometry(152, 88)
    oeuvre1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    oeuvre1.rotation.y = Math.PI * 0.5
    oeuvre1.position.set(multimedia[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvre2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    oeuvre2.rotation.y = Math.PI * 0.5
    oeuvre2.position.set(multimedia[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvre3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    oeuvre3.rotation.y = Math.PI * 0.5
    oeuvre3.position.set(multimedia[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvre1, oeuvre2, oeuvre3)

    // Oeuvres flottantes Communication
    oeuvreCom1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    oeuvreCom1.rotation.y = Math.PI * 0.5
    oeuvreCom1.position.set(communication[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreCom2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    oeuvreCom2.rotation.y = Math.PI * 0.5
    oeuvreCom2.position.set(communication[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreCom3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    oeuvreCom3.rotation.y = Math.PI * 0.5
    oeuvreCom3.position.set(communication[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvreCom1, oeuvreCom2, oeuvreCom3)
    
    // Oeuvres flottantes Infographie
    oeuvreInfo1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    oeuvreInfo1.rotation.y = Math.PI * 0.5
    oeuvreInfo1.position.set(infographie[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreInfo2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    oeuvreInfo2.rotation.y = Math.PI * 0.5
    oeuvreInfo2.position.set(infographie[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreInfo3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    oeuvreInfo3.rotation.y = Math.PI * 0.5
    oeuvreInfo3.position.set(infographie[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvreInfo1, oeuvreInfo2, oeuvreInfo3)
    
    // Oeuvres flottantes Audiovisuel
    oeuvreAudio1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    oeuvreAudio1.rotation.y = Math.PI * 0.5
    oeuvreAudio1.position.set(audiovisuel[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreAudio2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    oeuvreAudio2.rotation.y = Math.PI * 0.5
    oeuvreAudio2.position.set(audiovisuel[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreAudio3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    oeuvreAudio3.rotation.y = Math.PI * 0.5
    oeuvreAudio3.position.set(audiovisuel[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvreAudio1, oeuvreAudio2, oeuvreAudio3)
    
    // Oeuvres flottantes Web
    oeuvreWeb1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    oeuvreWeb1.rotation.y = Math.PI * 0.5
    oeuvreWeb1.position.set(web[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreWeb2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    oeuvreWeb2.rotation.y = Math.PI * 0.5
    oeuvreWeb2.position.set(web[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreWeb3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    oeuvreWeb3.rotation.y = Math.PI * 0.5
    oeuvreWeb3.position.set(web[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvreWeb1, oeuvreWeb2, oeuvreWeb3)
    
    // Oeuvres flottantes Animation
    oeuvreAnim1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    oeuvreAnim1.rotation.y = Math.PI * 0.5
    oeuvreAnim1.position.set(animation[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreAnim2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    oeuvreAnim2.rotation.y = Math.PI * 0.5
    oeuvreAnim2.position.set(animation[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreAnim3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    oeuvreAnim3.rotation.y = Math.PI * 0.5
    oeuvreAnim3.position.set(animation[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvreAnim1, oeuvreAnim2, oeuvreAnim3)

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
    var interactable = [collideHub]
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

    cameraHelper.init(camera, chassis, gRenderer.domElement, 2);
    
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

        const elapsedTime = clock.getElapsedTime()

        effectComposer.render()

        floorMaterial.uniforms.uTime.value = elapsedTime

        if(chassis.position.x >= web[0]){
            horizonGalerie.position.set(chassis.position.x - 3000, 1, -180)
        } else {
            horizonGalerie.position.set(positionHorizon, 1, -180)
        }

        horizonLight.position.set(horizonGalerie.position.x, 700 , 150)

    raycaster.setFromCamera(mouse, camera)
    const objectsToTest = [oeuvre1, oeuvre2, oeuvre3, oeuvreCom1, oeuvreCom2, oeuvreCom3, oeuvreInfo1, oeuvreInfo2, oeuvreInfo3, oeuvreAudio1, oeuvreAudio2, oeuvreAudio3, oeuvreWeb1, oeuvreWeb2, oeuvreWeb3, oeuvreAnim1, oeuvreAnim2, oeuvreAnim3]
    const intersects = raycaster.intersectObjects(objectsToTest);

    if(intersects.length){
        if(!currentIntersect){
            // console.log('mouse enter')
            // console.log(intersects[0])
        }
        
        currentIntersect = intersects[0]
        //currentIntersect.object.material.color.set("#0000ff")
    } else {
        if(currentIntersect){
            // console.log('mouse leave')
        }
        currentIntersect = null
    }

    // for(const object of objectsToTest){
    //     if(!intersects.find(intersect => intersect.object === object)){
    //         //object.material.color.set("#ff0000")
    //     }
    // }

    if (pause) {
        return;
    }

    if(chassis != undefined){
        pointLight.position.x = chassis.position.x
    }

    // personControls.update(clock.getDelta())
    
    updatePhysics();

    if (wireframeRenderer) {
        wireframeRenderer.update();
    }
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