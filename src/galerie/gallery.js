import '../style/main.css'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from '../utils.js';
import createVehicle from '../raycastVehicle.js';
import {cameraHelper} from '../cameraHelper.js';
// import cannonDebugger from 'cannon-es-debugger';
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
// import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
// // import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

// Contenu pour le multimédia
var Multimedia1
var Multimedia2
var Multimedia3
var artistsMultimedia
var Communication1
var Communication2
var Communication3
var artistsCommunication
var Infographie1
var Infographie2
var Infographie3
var Infographie4
var artistsInfographie
var Audiovisuel1
var Audiovisuel2
var Audiovisuel3
var artistsAudiovisuel
var Web1
var Web2
var Web3
var artistsWeb
var Animation1
var Animation2
var Animation3
var artistsAnimation
var infos

var Son1
var Son2
var Son3
var artistsSon
var Public1
var Public2
var Public3
var artistsPublic


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

//  // EffectComposer
//  const effectComposer = new EffectComposer(gRenderer)
//  effectComposer.setSize(sizes.width, sizes.height)
//  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//  const renderPass = new RenderPass(gScene, camera)
//  effectComposer.addPass(renderPass)
//  // Antialiasing
//  const smaaPass = new SMAAPass()
//  effectComposer.addPass(smaaPass)

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

const directionLight = new THREE.DirectionalLight(0xffffff, 0.5);
gScene.add(directionLight, directionLight.target)
// const helper = new THREE.DirectionalLightHelper(directionLight, 5);
// gScene.add(helper)
// const spot1 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot1.position.set(-200, 0, -100)
// const spot2 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot2.position.set(-500, 0, 100)
// const spot3 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot3.position.set(-800, 0, -100)
// const spot4 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot4.position.set(-1100, 0, 100)
// const spot5 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot5.position.set(-1400, 0, -100)
// const spot6 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot6.position.set(-1700, 0, 100)
// const spot7 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot7.position.set(-2000, 0, -100)
// const spot8 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot8.position.set(-2300, 0, 100)
// const spot9 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot9.position.set(-2600, 0, -100)
// const spot10 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot10.position.set(-2900, 0, 100)
// const spot11 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot11.position.set(-3200, 0, -100)
// const spot12 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot12.position.set(-3500, 0, 100)
// const spot13 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot13.position.set(-3800, 0, -100)
// const spot14 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot14.position.set(-4100, 0, 100)
// const spot15 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot15.position.set(-4400, 0, -100)
// const spot16 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot16.position.set(-4700, 0, 100)
// const spot17 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot17.position.set(-5000, 0, -100)
// const spot18 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot18.position.set(-5300, 0, 100)
// const spot19 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot19.position.set(-5600, 0, -100)
// const spot20 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot20.position.set(-5900, 0, 100)
// const spot21 = new THREE.PointLight('#0DC6FD', 1, 200)
// spot21.position.set(-6200, 0, -100)
// gScene.add(spot1, spot2, spot3, spot4, spot5, spot6, spot7, spot8, spot9, spot10, spot11, spot12, spot13, spot14, spot15, spot16, spot17, spot18, spot19, spot20, spot21)

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

const multimedia = [40, 80, 0];
var oeuvre1, oeuvre2, oeuvre3;
const hauteurOeuvre = 70;
const ecartOeuvre = 225;
const communication = [multimedia[0]-(ecartOeuvre*4), multimedia[1], multimedia[2]];
var oeuvreCom1, oeuvreCom2, oeuvreCom3;
const infographie = [communication[0]-(ecartOeuvre*3), communication[1], communication[2]];
var oeuvreInfo1, oeuvreInfo2, oeuvreInfo3, oeuvreInfo4;
const audiovisuel = [infographie[0]-(ecartOeuvre*5), infographie[1], infographie[2]];
var oeuvreAudio1, oeuvreAudio2, oeuvreAudio3;
const web = [audiovisuel[0]-(ecartOeuvre*4), audiovisuel[1], audiovisuel[2]];
var oeuvreWeb1, oeuvreWeb2, oeuvreWeb3;
const animation = [web[0]-(ecartOeuvre*4), web[1], web[2]];
var oeuvreAnim1, oeuvreAnim2, oeuvreAnim3;
var pontTron, pontTronBody;
var horizonGalerie;
var positionHorizon = -6500;
var boutHorizon = [];
var fontUsed;
var objJSON;
var i = -1;
var textures = [];

(async function init() {

    const [wheelGLTF, chassisGLTF, hansonJSON, pontTronGLTF, horizonGLTF, recognizerGLTF,
        /*MultimediaOeuvre1PNG, */MultimediaOeuvre2PNG, MultimediaOeuvre3PNG,
        CommunicationOeuvre1PNG, CommunicationOeuvre2PNG,
        InfographieOeuvre1PNG, InfographieOeuvre2PNG, InfographieOeuvre3PNG, InfographieOeuvre4PNG,
        AudiovisuelOeuvre1PNG, AudiovisuelOeuvre2PNG, AudiovisuelOeuvre3PNG,
        WebOeuvre1PNG, WebOeuvre2PNG, WebOeuvre3PNG,
        AnimationOeuvre1PNG, AnimationOeuvre2PNG, AnimationOeuvre3PNG,
        testJSON] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        utils.loadResource('fonts/Hanson_Bold.json'),
        utils.loadResource('model/Pont.gltf'),
        utils.loadResource('model/horizon_optimized.gltf'),
        utils.loadResource('model/recognizer_optimized.gltf'),
        // utils.loadResource('image/oeuvres/multimedia/oeuvre_1.jpg'),
        utils.loadResource('image/oeuvres/multimedia/oeuvre_2.jpg'),
        utils.loadResource('image/oeuvres/multimedia/oeuvre_3.jpg'),
        utils.loadResource('image/oeuvres/communication/oeuvre_1.jpg'),
        utils.loadResource('image/oeuvres/communication/oeuvre_2.jpg'),
        utils.loadResource('image/oeuvres/infographie/oeuvre_1.jpg'),
        utils.loadResource('image/oeuvres/infographie/oeuvre_2.jpg'),
        utils.loadResource('image/oeuvres/infographie/oeuvre_3.jpg'),
        utils.loadResource('image/oeuvres/infographie/oeuvre_4.jpg'),
        utils.loadResource('image/oeuvres/audiovisuel/oeuvre_1.jpg'),
        utils.loadResource('image/oeuvres/audiovisuel/oeuvre_2.jpg'),
        utils.loadResource('image/oeuvres/audiovisuel/oeuvre_3.jpg'),
        utils.loadResource('image/oeuvres/web/oeuvre_1.jpg'),
        utils.loadResource('image/oeuvres/web/oeuvre_2.jpg'),
        utils.loadResource('image/oeuvres/web/oeuvre_3.jpg'),
        utils.loadResource('image/oeuvres/animation/oeuvre_1.jpg'),
        utils.loadResource('image/oeuvres/animation/oeuvre_2.jpg'),
        utils.loadResource('image/oeuvres/animation/oeuvre_3.jpg'),
        utils.loadResource('infos/test.txt')
    ]);

    objJSON = JSON.parse(testJSON)

    
    for(var cat in objJSON.categories){
        for(var oeuvre in objJSON.categories[cat].oeuvres){
            i = i+1
            console.log(i)
            textures[i] = await Promise.all([
                utils.loadResource(objJSON.categories[cat].oeuvres[oeuvre].texture)
            ]);
        }
    }

    console.log(textures)

    const [MultimediaOeuvre1PNG] = await Promise.all([
        utils.loadResource(objJSON.categories[0].oeuvres[0].texture)
    ]);


    // Contenu pour le multimédia (Texture/Nom/IUT/Lien)
    Multimedia1 = [MultimediaOeuvre1PNG, "Ecobook", "IUT de Chambéry",  "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=1039"];
    Multimedia2 = [MultimediaOeuvre2PNG, "Trieste", "IUT de Bordeaux Montaigne",  "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=885"];
    Multimedia3 = [MultimediaOeuvre3PNG, "Amoco Cadiz - Histoire d'une marée noire", "IUT de Laval", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=1040"];
    artistsMultimedia = [Multimedia1, Multimedia2, Multimedia3];

    // Contenu pour la communication (Texture/Nom/IUT/Lien)
    Communication1 = [CommunicationOeuvre1PNG, "Quel métier après MMI ? - Webdesigner", "IUT de Sénart Fontainebleau", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=966"];
    Communication2 = [CommunicationOeuvre2PNG, "Quel métier après MMI ? Motion Designer", "IUT de Béziers", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=901"];
    // Communication3 = [CommunicationOeuvre3PNG, "Bonjour", "IUT de Champs-sur-Marne", "https://www.youtube.com/watch?v=1V_xRb0x9aw"];
    artistsCommunication = [Communication1, Communication2]

    // Contenu pour l'infographie (Texture/Nom/IUT/Lien)
    Infographie1 = [InfographieOeuvre1PNG, "MMI Foundry", "IUT de Elbeuf",  "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=829"];
    Infographie2 = [InfographieOeuvre2PNG, "Missing Passenger", "IUT de Nouméa", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=1012"];
    Infographie3 = [InfographieOeuvre3PNG, "Pourquoi ?", "IUT de Haguenau", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=824"];
    Infographie4 = [InfographieOeuvre4PNG, "Jack Daniel's and cigarette", "IUT de Saint-Dié-Des-Vosges", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=873"];
    artistsInfographie = [Infographie1, Infographie2, Infographie3, Infographie4]

    // Contenu pour l'audiovisuel (Texture/Nom/IUT/Lien)
    Audiovisuel1 = [AudiovisuelOeuvre1PNG, "Ascension", "IUT de Montbéliard", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=714"];
    Audiovisuel2 = [AudiovisuelOeuvre2PNG, "Aujourd'hui, c'est quoi avoir 20 ans ?", "IUT du Puy en Velay", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=1035"];
    Audiovisuel3 = [AudiovisuelOeuvre3PNG, "La salle des rêves", "IUT de Grenoble", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=915"];
    artistsAudiovisuel = [Audiovisuel1, Audiovisuel2, Audiovisuel3]
    
    // Contenu pour le web (Texture/Nom/IUT/Lien)
    Web1 = [WebOeuvre1PNG, "Immersions Digitales 2021", "IUT de Tarbes", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=833"];
    Web2 = [WebOeuvre2PNG, "REAH", "IUT de Champs-sur-Marne", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=911"];
    Web3 = [WebOeuvre3PNG, "Tactical", "IUT de Bordeaux Montaigne", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=847"];
    artistsWeb = [Web1, Web2, Web3]
    
    // Contenu pour l'animation (Texture/Nom/IUT/Lien)
    Animation1 = [AnimationOeuvre1PNG, "CGI 3D court-métrage: 'Liechi'", "IUT de Béziers", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=842"];
    Animation2 = [AnimationOeuvre2PNG, "CV Vidéo Motion Design - 2020", "IUT de Laval", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=942"];
    Animation3 = [AnimationOeuvre3PNG, "Ken : Final Mix (Autoportrait)", "IUT de Nouméa", "https://www.festival2021.iutmmi.fr/2021.apercu.256_ybj.html?var=id&ch=1004"];
    artistsAnimation = [Animation1, Animation2, Animation3]

    infos = [artistsMultimedia, artistsCommunication, artistsInfographie, artistsAudiovisuel, artistsWeb, artistsAnimation];

    fontUsed = hansonJSON

    


    // Sol
    
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
    gScene.add(horizonGalerie)

    // Recognizers
    const recognizer = recognizerGLTF.scene
    recognizer.scale.set(10, 10, 10)
    recognizer.rotation.y = -Math.PI*0.5
    var panneaux = [
        recognizer,
        recognizer.clone(),
        recognizer.clone(),
        recognizer.clone(),
        recognizer.clone(),
        recognizer.clone()
    ]

    panneaux.forEach(function(item, index){
        gScene.add(panneaux[index])
    })

    

    // Pont retour vers Hub
    pontTron = pontTronGLTF.scene
    pontTron.scale.set(3.3, 3.3, 3.3)
    pontTron.rotation.set(0, -Math.PI*0.5, 0)
    pontTron.position.set(-5800,1,0)
    gScene.add(pontTron)

    // Collider vers hub
    const collideShape = new CANNON.Box(new CANNON.Vec3(10, 10, 20))
    const collideHub = new CANNON.Body({
        mass:0,
        shape: collideShape,
        position: new CANNON.Vec3(-5600, 0,0),
    })
    collideHub.collisionResponse = 0
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
            size: 10,
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
    textMultimedia.rotateY(Math.PI/2)
    textMultimedia.rotateX(Math.PI*0.1)
    textMultimediaGeometry.center()
    textMultimedia.position.set(multimedia[0]-30, multimedia[1], multimedia[2])
    
    const textCommunicationGeometry = new THREE.TextGeometry(
        'communication',
        {
            font: hansonJSON,
            size: 8,
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
    textCommunication.rotateY(Math.PI/2)
    textCommunication.rotateX(Math.PI*0.1)
    textCommunicationGeometry.center()
    textCommunication.position.set(communication[0], communication[1], communication[2])
    panneaux[1].position.x = communication[0]-10

    const textInfoGeometry = new THREE.TextGeometry(
        'infographie',
        {
            font: hansonJSON,
            size: 10,
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
    textInfo.rotateY(Math.PI/2)
    textInfo.rotateX(Math.PI*0.1)
    textInfoGeometry.center()
    textInfo.position.set(infographie[0], infographie[1], infographie[2])
    panneaux[2].position.x = infographie[0]-10
    
    const textAudioGeometry = new THREE.TextGeometry(
        'audiovisuel',
        {
            font: hansonJSON,
            size: 10,
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
    textAudio.rotateY(Math.PI/2)
    textAudio.rotateX(Math.PI*0.1)
    textAudioGeometry.center()
    textAudio.position.set(audiovisuel[0], audiovisuel[1], audiovisuel[2])
    panneaux[3].position.x = audiovisuel[0] -10

    const textWebGeometry = new THREE.TextGeometry(
        'site web',
        {
            font: hansonJSON,
            size: 10,
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
    textWeb.rotateY(Math.PI*0.5)
    textWeb.rotateX(Math.PI*0.1)
    textWebGeometry.center()
    textWeb.position.set(web[0], web[1], web[2])
    panneaux[4].position.x = web[0] - 10
    
    const textAnimGeometry = new THREE.TextGeometry(
        'animation',
        {
            font: hansonJSON,
            size: 10,
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
    textAnim.rotateY(Math.PI*0.5)
    textAnim.rotateX(Math.PI*0.1)
    textAnimGeometry.center()
    textAnim.position.set(animation[0], animation[1], animation[2])
    panneaux[5].position.x = animation[0]-10

    gScene.add(textMultimedia, textCommunication, textInfo, textAudio, textWeb, textAnim)

    // Oeuvres flottantes Multimedia
    const oeuvreGeometry = new THREE.PlaneGeometry(152, 88)
    oeuvre1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: infos[0][0][0]})
        // new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    oeuvre1.rotation.y = Math.PI * 0.5
    oeuvre1.position.set(multimedia[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvre2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: infos[0][1][0]})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    oeuvre2.rotation.y = Math.PI * 0.5
    oeuvre2.position.set(multimedia[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvre3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: infos[0][2][0]})
    )
    oeuvre3.rotation.y = Math.PI * 0.5
    oeuvre3.position.set(multimedia[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvre1, oeuvre2, oeuvre3)

    // Oeuvres flottantes Communication
    oeuvreCom1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: CommunicationOeuvre1PNG})
    )
    oeuvreCom1.rotation.y = Math.PI * 0.5
    oeuvreCom1.position.set(communication[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreCom2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: CommunicationOeuvre2PNG})
    )
    oeuvreCom2.rotation.y = Math.PI * 0.5
    oeuvreCom2.position.set(communication[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    // oeuvreCom3 = new THREE.Mesh(
    //     oeuvreGeometry,
    //     new THREE.MeshStandardMaterial({map: CommunicationOeuvre3PNG})
    // )
    // oeuvreCom3.rotation.y = Math.PI * 0.5
    // oeuvreCom3.position.set(communication[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvreCom1, oeuvreCom2)
    
    // Oeuvres flottantes Infographie
    oeuvreInfo1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: InfographieOeuvre1PNG})
    )
    oeuvreInfo1.rotation.y = Math.PI * 0.5
    oeuvreInfo1.position.set(infographie[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreInfo2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: InfographieOeuvre2PNG})
    )
    oeuvreInfo2.rotation.y = Math.PI * 0.5
    oeuvreInfo2.position.set(infographie[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreInfo3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: InfographieOeuvre3PNG})
    )
    oeuvreInfo3.rotation.y = Math.PI * 0.5
    oeuvreInfo3.position.set(infographie[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    
    oeuvreInfo4 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: InfographieOeuvre4PNG})
    )
    oeuvreInfo4.rotation.y = Math.PI * 0.5
    oeuvreInfo4.position.set(infographie[0]-(ecartOeuvre*4), hauteurOeuvre, 0)
    gScene.add(oeuvreInfo1, oeuvreInfo2, oeuvreInfo3, oeuvreInfo4)
    
    // Oeuvres flottantes Audiovisuel
    oeuvreAudio1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: AudiovisuelOeuvre1PNG})
    )
    oeuvreAudio1.rotation.y = Math.PI * 0.5
    oeuvreAudio1.position.set(audiovisuel[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreAudio2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: AudiovisuelOeuvre2PNG})
    )
    oeuvreAudio2.rotation.y = Math.PI * 0.5
    oeuvreAudio2.position.set(audiovisuel[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreAudio3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: AudiovisuelOeuvre3PNG})
    )
    oeuvreAudio3.rotation.y = Math.PI * 0.5
    oeuvreAudio3.position.set(audiovisuel[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvreAudio1, oeuvreAudio2, oeuvreAudio3)
    
    // Oeuvres flottantes Web
    oeuvreWeb1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: WebOeuvre1PNG})
    )
    oeuvreWeb1.rotation.y = Math.PI * 0.5
    oeuvreWeb1.position.set(web[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreWeb2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: WebOeuvre2PNG})
    )
    oeuvreWeb2.rotation.y = Math.PI * 0.5
    oeuvreWeb2.position.set(web[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreWeb3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: WebOeuvre3PNG})
    )
    oeuvreWeb3.rotation.y = Math.PI * 0.5
    oeuvreWeb3.position.set(web[0]-(ecartOeuvre*3), hauteurOeuvre, 0)
    gScene.add(oeuvreWeb1, oeuvreWeb2, oeuvreWeb3)
    
    // Oeuvres flottantes Animation
    oeuvreAnim1 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: AnimationOeuvre1PNG})
    )
    oeuvreAnim1.rotation.y = Math.PI * 0.5
    oeuvreAnim1.position.set(animation[0]-ecartOeuvre, hauteurOeuvre, 0)
    
    oeuvreAnim2 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: AnimationOeuvre2PNG})
    )
    oeuvreAnim2.rotation.y = Math.PI * 0.5
    oeuvreAnim2.position.set(animation[0]-(ecartOeuvre*2), hauteurOeuvre, 0)
   
    oeuvreAnim3 = new THREE.Mesh(
        oeuvreGeometry,
        new THREE.MeshStandardMaterial({map: AnimationOeuvre3PNG})
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

const textCurrentMaterial = new THREE.MeshBasicMaterial()
var nameCurrent, nameCurrentGeometry, iutCurrent, iutCurrentGeometry, descCurrent, descCurrentGeometry, avertCurrentGeometry, avertCurrent;
var displayed = false;

window.addEventListener('click', () => {
    if(document.getElementById("cursor").classList.contains('look') && displayed == true){
        if(currentIntersect){
            for(var cat in objJSON.categories){
                for(var nomin in objJSON.categories[cat].oeuvres){
                    var path = currentIntersect.object.material.map.image.src;
                    var page = path.split("image").pop();
                    var compare = objJSON.categories[cat].oeuvres[nomin].texture.split("image").pop();
                    if(page == compare){
                        window.open(objJSON.categories[cat].oeuvres[nomin].link)
                    }
                }
            }
        }
    }else 
    if(document.getElementById("cursor").classList.contains('cross')){
        document.getElementById("cursor").classList.remove("cross")
        document.getElementById("canvas").style.cursor = "auto"
        cameraHelper.init(camera, chassis, gRenderer.domElement, 2);
        gScene.remove(nameCurrent, iutCurrent/*, descCurrent*/, avertCurrent)
        displayed = false
    } else
    if(currentIntersect){
        displayed = true;
            for(var cat in objJSON.categories){
                for(var nomin in objJSON.categories[cat].oeuvres){
                    var path = currentIntersect.object.material.map.image.src;
                    var page = path.split("image").pop();
                    var compare = objJSON.categories[cat].oeuvres[nomin].texture.split("image").pop();
                    if(page == compare){
                        nameCurrentGeometry = new THREE.TextGeometry(
                            objJSON.categories[cat].oeuvres[nomin].name,
                            {
                                font: fontUsed,
                                size: 5,
                                height: 0.5,
                                curveSegments: 12,
                                bevelEnabled: true,
                                bevelThickness: 0.03,
                                bevelSize: 0.02,
                                bevelOffset: 0,
                                bevelSegments: 5
                            }
                        )
                        iutCurrentGeometry = new THREE.TextGeometry(
                            objJSON.categories[cat].oeuvres[nomin].iut,
                            {
                                font: fontUsed,
                                size: 5,
                                height: 0.5,
                                curveSegments: 12,
                                bevelEnabled: true,
                                bevelThickness: 0.03,
                                bevelSize: 0.02,
                                bevelOffset: 0,
                                bevelSegments: 5
                            }
                        )
                        avertCurrentGeometry = new THREE.TextGeometry(
                            "Cliquez sur l'oeuvre pour en savoir plus",
                            {
                                font: fontUsed,
                                size: 3,
                                height: 0.5,
                                curveSegments: 12,
                                bevelEnabled: true,
                                bevelThickness: 0.03,
                                bevelSize: 0.02,
                                bevelOffset: 0,
                                bevelSegments: 5
                            }
                        )
                        // descCurrentGeometry = new THREE.TextGeometry(
                        //     infos[cat][nomin][3],
                        //     {
                        //         font: fontUsed,
                        //         size: 3,
                        //         height: 0.5,
                        //         curveSegments: 12,
                        //         bevelEnabled: true,
                        //         bevelThickness: 0.03,
                        //         bevelSize: 0.02,
                        //         bevelOffset: 0,
                        //         bevelSegments: 5
                        //     }
                        // )
                    }
                }
            }
        nameCurrentGeometry.center();
        nameCurrent = new THREE.Mesh(nameCurrentGeometry, textCurrentMaterial)
        nameCurrent.rotation.y = -Math.PI*1.5
        nameCurrent.position.set(currentIntersect.object.position.x, 130, 0)

        iutCurrentGeometry.center()
        iutCurrent = new THREE.Mesh(iutCurrentGeometry, textCurrentMaterial)
        iutCurrent.rotation.y = -Math.PI*1.5
        iutCurrent.position.set(currentIntersect.object.position.x, 120, 0)
        
        avertCurrentGeometry.center()
        avertCurrent = new THREE.Mesh(avertCurrentGeometry, textCurrentMaterial)
        avertCurrent.rotation.y = -Math.PI*1.5
        avertCurrent.position.set(currentIntersect.object.position.x, 20, 0)
        
        // descCurrent = new THREE.Mesh(descCurrentGeometry, textCurrentMaterial)
        // descCurrent.rotation.y = -Math.PI*1.5
        // descCurrent.position.set(currentIntersect.object.position.x, 70, -25)


        gScene.add(nameCurrent, iutCurrent, avertCurrent/*, descCurrent*/)
        // }
        document.getElementById('canvas').style.cursor = "none"
        document.getElementById("cursor").classList.add("look")
        if(chassis != undefined){
            cameraHelper.switch(currentIntersect)
        }
    }
    
})

function render() {
    if(document.getElementById("load").classList.contains("hidden")){

        const elapsedTime = clock.getElapsedTime()

        // effectComposer.render()

        if(chassis.position.x >= web[0]){
            horizonGalerie.position.set(chassis.position.x - 3000, 1, -180)
        } else {
            horizonGalerie.position.set(positionHorizon, 1, -180)
        }

        directionLight.position.copy(chassis.position)
        directionLight.target.position.set(chassis.position.x-150, 50, 0)


        horizonLight.position.set(horizonGalerie.position.x+ 250, 700 , 150)

    raycaster.setFromCamera(mouse, camera)
    const objectsToTest = [oeuvre1, oeuvre2, oeuvre3, oeuvreCom1, oeuvreCom2, oeuvreInfo1, oeuvreInfo2, oeuvreInfo3, oeuvreInfo4, oeuvreAudio1, oeuvreAudio2, oeuvreAudio3, oeuvreWeb1, oeuvreWeb2, oeuvreWeb3, oeuvreAnim1, oeuvreAnim2, oeuvreAnim3]
    const intersects = raycaster.intersectObjects(objectsToTest);

    if(intersects.length){
        if(!currentIntersect){
            document.getElementById("canvas").style.cursor = "none"
            document.getElementById("cursor").classList.add("look")
            if(displayed == true){
            document.getElementById("cursor").classList.add("look")
            document.getElementById("cursor").classList.remove("cross")
            }
            // console.log('mouse enter')
            // console.log(intersects[0])
        }
        
        currentIntersect = intersects[0]
        //currentIntersect.object.material.color.set("#0000ff")
    } else {
        if(currentIntersect){
            if(displayed == true){
            document.getElementById("cursor").classList.remove("look")
            document.getElementById("canvas").style.cursor = "none"
            document.getElementById("cursor").classList.add("cross")
            }else{
            document.getElementById("canvas").style.cursor = "auto"
            }
            document.getElementById('cursor').classList.remove('look')
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