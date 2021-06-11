import './style/main.css'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from './utils.js';
import createVehicle from './raycastVehicle.js';
import {cameraHelper} from './cameraHelper.js';
// import cannonDebugger from 'cannon-es-debugger'
import { DoubleSide } from 'three';
import gsap from 'gsap/gsap-core';

const worldStep = 1/60;

const gWorld = new CANNON.World();
const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer(/*{antialias: true}*/{
    canvas: document.querySelector('.webgl')
});

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

 gRenderer.setPixelRatio(2)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)

camera.position.y = 3
camera.position.z = -10
gScene.add(camera)


const ambientLight = new THREE.AmbientLight('#706F6F', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 800)
pointLight.position.set(50, 500, -150)
gScene.add(pointLight)

const secondLight = new THREE.PointLight(0xffffff, 1, 1200)
secondLight.position.set(150, 0, 0)
gScene.add(secondLight)

gRenderer.setClearColor('#D9AE71')

const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(200, 200, 600, 32),
    new THREE.MeshStandardMaterial({color: '#D9AE71'}),
)
// const floor = new THREE.Mesh(
    // new THREE.BoxGeometry(400, 400, 600),
    // new THREE.MeshStandardMaterial({color: '#D9AE71'}),
// )
floor.material.side = THREE.DoubleSide
// floor.rotation.x = - Math.PI * 0.5
floor.position.y = -300
floor.position.z = 2
gScene.add(floor)

//Floor phys
const floorShape = new CANNON.Cylinder(200, 200, 100, 32)
// const floorShape = new CANNON.Box(new CANNON.Vec3(200, 1, 200))
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(0, -50, 0),
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

const vehicleInitialPosition = new THREE.Vector3(0, 50, 0);
// const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -Math.PI / 2);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);
let resetVehicle = () => {};

var gameTp
var gameTpBody;

var vehicle

var pontGallery, pontGalleryBody

var pupitreArtists, pupitreArtistsBody, textNomin

var ceremonie, theatreBodyPart1, theatreBodyPart2, ceremonieBody, barriere1, barriere2;

var mentionsBody;

var mentionsLength = 20;
var mentionsZ = 8;
var planeEnter;

(async function init() {

    const [wheelGLTF, chassisGLTF, /*gameTpGLTF,*/ pontGalleryGLTF, pupitreArtistsGLTF, theatreGLTF, hansonJSON, SolGLTF] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        // utils.loadResource('model/teleport_game.gltf'),
        utils.loadResource('model/Pont.gltf'),
        utils.loadResource('model/Pupitre.gltf'),
        utils.loadResource('model/theatre.gltf'),
        utils.loadResource('fonts/Hanson_Bold.json'),
        utils.loadResource('model/petits_cailloux.gltf')
    ]);

    const wheel = wheelGLTF.scene;
    const chassis = chassisGLTF.scene;
    
    // Téléporteur vers les iles
    // gameTp = gameTpGLTF.scene;
    // gameTp.position.set(7, 1.8, 12)
    // gameTp.scale.set(11, 11, 11)

    // gScene.add(gameTp)

    // Sol
    const cailloux = SolGLTF.scene
    const caillouxMaterial = new THREE.MeshStandardMaterial({color: '#2D2B27'})
    // cailloux.material = caillouxMaterial
    cailloux.scale.set(0.1, 0.1, 0.02)
    cailloux.rotation.x = -Math.PI*0.5
    var deco = [
        cailloux,
        cailloux.clone(),
        // cailloux.clone(),
        // cailloux.clone(),
        // cailloux.clone(),
        // cailloux.clone()
    ]
    // deco[1].children[0].position.set()
    // console.log(deco[1])

    // deco[0].rotation.z = Math.PI*0.5
    // deco[1].rotateX(-Math.PI*0.5)
    deco[1].scale.set(0.3, 0.3, 0.3)
    console.log(deco[0])
    // deco[0].children[2].material = caillouxMaterial
    deco.forEach(function(item, index){
        deco[index].traverse( function ( node ) {

            if ( node.isMesh ){
                node.material = caillouxMaterial;
            }
        
          } );
        // gScene.add(deco[index])
    })

    var display = [
        deco[1].children[2],
        deco[1].children[0],
        deco[1].children[1],
        deco[1].children[3],
        deco[1].children[4],
        deco[1].children[5],
    ]

    display[5].position.set(-55, 0.001, 90)
    display[5].scale.set(10, 10, 0.5)
    display[5].rotation.set(0, -Math.PI*0.2, 0)

    display[4].position.set(-20, 0.001, 40)
    display[4].scale.set(8, 0.5, 8)
    display[4].rotation.set(Math.PI*0.5, 0, Math.PI*0.2)

    display[3].position.set(70, 0.001, -55)
    display[3].scale.set(4, 4 ,0.5)

    display[2].position.set(45, 0.001, -30)
    display[2].scale.set(4, 4, 0.5)

    display[1].position.set(-40, 0.001, -20)
    display[1].rotation.set(0, -Math.PI*0.1, 0)
    display[1].scale.set(3, 3, 0.5)

    display[0].position.set(0, 0.01, 0)
    display[0].scale.set(20, 0.5, 20)

    display.forEach(function(item, index){
        console.log(display[index])
        // display[index].scale.set(5, 0.5, 5)
        display[index].rotateX(-Math.PI*0.5)
        gScene.add(display[index])
    })

    // Mentions légales
    const mentionsShape = new CANNON.Box(new CANNON.Vec3(mentionsLength,5,mentionsZ))
    mentionsBody = new CANNON.Body({
        shape: mentionsShape,
        mass:0,
    })
    mentionsBody.collisionResponse = 0
    mentionsBody.position.set(70, 0, 150)
    gWorld.addBody(mentionsBody)

    planeEnter = new THREE.Mesh(
        new THREE.PlaneGeometry(mentionsLength*2, mentionsZ*2),
        new THREE.MeshStandardMaterial({color: "#FF0000", side: DoubleSide})
    )
    planeEnter.name = "Mentions"
    planeEnter.rotateX(Math.PI * 0.5)
    planeEnter.position.set(mentionsBody.position.x, 0, mentionsBody.position.z)

    // Théâtre vers la cérémonie
    ceremonie = theatreGLTF.scene
    ceremonie.scale.set(8, 8, 8)
    ceremonie.position.set(-100, 0, -90)
    ceremonie.rotation.y = Math.PI*0.7
    gScene.add(ceremonie)

    // Collider théatre
    const theatreShape = new CANNON.Box(new CANNON.Vec3(30,15,25))
    theatreBodyPart1 = new CANNON.Body({
        mass: 0,
        shape: theatreShape,
        position: new CANNON.Vec3(-190, 10, -132),
        // quaternion: new CANNON.Quaternion(0, )
    })
    // theatreBodyPart1.rotation.y = Math.PI*0.7
    gWorld.addBody(theatreBodyPart1)
    theatreBodyPart2 = new CANNON.Body({
        mass: 0,
        shape: theatreShape,
        position: new CANNON.Vec3(-115, 10, -190)
    })
    gWorld.addBody(theatreBodyPart2)

    // Barrières
    const barriereShape = new CANNON.Box(new CANNON.Vec3(55,5,2))
    barriere1 = new CANNON.Body({
        mass: 0,
        shape: barriereShape,
        position: new CANNON.Vec3(-116, 5, -85)
    })
    gWorld.addBody(barriere1)
    
    barriere2 = new CANNON.Body({
        mass: 0,
        shape: barriereShape,
        position: new CANNON.Vec3(-83, 5, -95)
    })
    gWorld.addBody(barriere2)

    const ceremonieShape = new CANNON.Box(new CANNON.Vec3(25,15,15))
    ceremonieBody = new CANNON.Body({
        mass: 0,
        shape: ceremonieShape,
        position: new CANNON.Vec3(-150, 10, -160), 
        // quaternion: new CANNON.Quaternion(0, 0.5, 0)
    })
    gWorld.addBody(ceremonieBody)

    // Pupitre vers la page des Nominés
    pupitreArtists = pupitreArtistsGLTF.scene
    pupitreArtists.scale.set(12, 12, 12)
    pupitreArtists.rotation.y = -Math.PI*0.7
    gScene.add(pupitreArtists)

    // Collider pupitre
    const pupitreShape = new CANNON.Box(new CANNON.Vec3(15,5,15))
    const pontArtistShape = new CANNON.Box(new CANNON.Vec3(10,1, 20))
    pupitreArtistsBody = new CANNON.Body({
        mass: 0,
        shape: pupitreShape,
        position: new CANNON.Vec3(120, 5, -125),
        quaternion: new CANNON.Quaternion(0, -Math.PI*0.1, 0)
    })
    pupitreArtistsBody.addShape(pontArtistShape, new CANNON.Vec3(0, 0, 40), new CANNON.Quaternion(Math.PI*0.04, 0, 0))
    gWorld.addBody(pupitreArtistsBody)

    // const pontArtistShape = new CANNON.Box(new CANNON.Vec3(10,1, 20))
    // const pontArtists = new CANNON.Body({
    //     mass: 0,
    //     shape: pontArtistShape,
    //     position: new CANNON.Vec3(120, 5, -90),
    //     quaternion: new CANNON.Quaternion(0.15, 0, 0)
    // })
    // gWorld.addBody(pontArtists)

    // Collider vers la page des nominés
    const collideArtistsShape = new CANNON.Box(new CANNON.Vec3(5,5,5))
    const collideArtists = new CANNON.Body({
        mass: 0,
        shape: collideArtistsShape,
        position: new CANNON.Vec3(120, 20, -130),
    })
    gWorld.addBody(collideArtists)

    // Texte des nominés
    const textNominGeometry = new THREE.TextGeometry(
        'Les nominés',
        {
            font: hansonJSON,
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
    const textMaterial = new THREE.MeshBasicMaterial()
    textNomin = new THREE.Mesh(textNominGeometry, textMaterial)
    textNominGeometry.center()
    textNomin.rotation.y = -Math.PI*0.2
    textNomin.position.set(pupitreArtistsBody.position.x-10, pupitreArtistsBody.position.y + 15, pupitreArtistsBody.position.z + 14)
    gScene.add(textNomin)


    // Pont vers la galerie
    pontGallery = pontGalleryGLTF.scene
    pontGallery.scale.set(3.3, 3.3, 3.3)
    pontGallery.rotation.set(0, - Math.PI*0.3, 0)
    // pontGallery.position.set(-295, 1, 255)
    gScene.add(pontGallery)

    const bridgeShape = new CANNON.Box(new CANNON.Vec3(22, 1, 140))
    pontGalleryBody = new CANNON.Body({
        mass: 0,
        shape: bridgeShape,
        position: new CANNON.Vec3(-205, 0, 205) ,
        quaternion: new CANNON.Quaternion(0, -Math.PI*0.14, 0)
    })
    gWorld.addBody(pontGalleryBody)

    // Collider vers galerie
    const collideShape = new CANNON.Box(new CANNON.Vec3(22, 10, 50))
    const collideGallery = new CANNON.Body({
        mass:1000,
        shape: collideShape,
        position: new CANNON.Vec3(-205, 15, 205),
        quaternion: new CANNON.Quaternion(0, -0.47, 0)
    })
    gWorld.addBody(collideGallery)
    
    // Texte de la galerie
    const textGalerieGeometry = new THREE.TextGeometry(
        'Le palmarès',
        {
            font: hansonJSON,
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
    const textGalerie = new THREE.Mesh(textGalerieGeometry, textMaterial)
    textGalerieGeometry.center()
    textGalerie.position.set(pontGalleryBody.position.x + 195, pontGalleryBody.position.y + 15, pontGalleryBody.position.z -95)
    gScene.add(textGalerie)

    // Teleport Game phys
    // const gameTpShape = new CANNON.Box(new CANNON.Vec3(11, 11, 11))
    // gameTpBody = new CANNON.Body({
    //     mass: 1000,
    //     position: new CANNON.Vec3(100, 22, 150),
    //     shape: gameTpShape,
    //     quaternion: new CANNON.Quaternion(1, 0, -0.5)
    // })
    // gWorld.addBody(gameTpBody)

    // setMaterials(wheel, chassis);
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
    var interactable = [collideGallery, collideArtists, ceremonieBody, mentionsBody]
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

    updatePhysics();

    cameraHelper.update();

    // gameTp.position.copy(gameTpBody.position)
    // gameTp.quaternion.copy(gameTpBody.quaternion)

    pupitreArtists.position.copy(pupitreArtistsBody.position)
    pupitreArtists.position.y = 0

    barriere1.quaternion.copy(ceremonie.quaternion)
    barriere2.quaternion.copy(ceremonie.quaternion)
    ceremonieBody.quaternion.copy(ceremonie.quaternion)
    theatreBodyPart1.quaternion.copy(ceremonie.quaternion)
    theatreBodyPart2.quaternion.copy(ceremonie.quaternion)

    gRenderer.render(gScene, camera);

    if(vehicle.chassisBody.position.y <= -100){
        resetVehicle()
    }

    pontGallery.position.copy(pontGalleryBody.position)
    
    

    if(vehicle.chassisBody.position.x >= mentionsBody.position.x - (mentionsLength) && vehicle.chassisBody.position.x <= mentionsBody.position.x + (mentionsLength) && vehicle.chassisBody.position.z >= mentionsBody.position.z - (mentionsZ) && vehicle.chassisBody.position.z <= mentionsBody.position.z + (mentionsZ)){
        gScene.add(planeEnter)
        gsap.to(planeEnter.position, {duration: 0.2, y: 6})
        
    } else{
        if(gScene.getObjectByName("Mentions")){
            gsap.to(planeEnter.position, {duration: 0.15, y: -1})
            setTimeout(function(){
                gScene.remove(planeEnter)
            }, 150)
        }
    }

    requestAnimationFrame(render);

    
}

window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'V':
            resetVehicle();
            break;
        case 'ENTER':
            if(gScene.getObjectByName("Mentions")){
                window.location.pathname = "./immersions/mentions_legales.html"
                // window.location.pathname = "./mentions_legales.html"
            }
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
