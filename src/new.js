import './style/main.scss'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from './utils.js';
import createVehicle from './raycastVehicle.js';
import {cameraHelper} from './cameraHelper.js';
import cannonDebugger from 'cannon-es-debugger'
import { DoubleSide } from 'three';
import './menu.js'

// document.body.addEventListener('contextmenu', e => e.preventDefault() & e.stopPropagation());
// document.body.addEventListener('mousedown', onMouseDown);
// document.body.addEventListener('touchstart', e => onMouseDown(e.touches[0]));
// document.body.addEventListener('mouseup', onMouseUp);
// document.body.addEventListener('touchend', e => onMouseUp(e.touches[0]));
// document.body.addEventListener('mousemove', onMouseMove);
// document.body.addEventListener('touchmove', e => onMouseMove(e.touches[0]));

// let value, showing, anchorX, anchorY, min = 100;
// const wheel = document.querySelector('.wheel');
// const links = ["./index.html", "./gallery.html", './artists.html', "./iut.html", "./game.html", "./mentions_legales.html", "./anciens.html", "https://youtu.be/VrPx1opuGQM"]

// function onMouseDown({ clientX: x, clientY: y }) {
// 	showing = true;
// 	anchorX = x;
// 	anchorY = y;

// 	wheel.style.setProperty('--x', `${x}px`);
// 	wheel.style.setProperty('--y', `${y}px`);
// 	wheel.classList.add('on');
// }

// function onMouseUp() {
// 	showing = false;
//     console.log(value)
// 	wheel.setAttribute('data-chosen', 0);
// 	wheel.classList.remove('on');
//     if(value != undefined && value >=0){
//         window.location.href = links[value]
//     }
// }

// function onMouseMove({ clientX: x, clientY: y }) {
// 	if (!showing) return;

// 	let dx = x - anchorX;
// 	let dy = y - anchorY;
// 	let mag = Math.sqrt(dx * dx + dy * dy);
// 	let index = 0;

// 	if (mag >= min) {
// 		let deg = Math.atan2(dy, dx) + 0.625 * Math.PI;
// 		while (deg < 0) deg += Math.PI * 2;
// 		index = Math.floor(deg / Math.PI * 4) + 1;
// 	}

// 	wheel.setAttribute('data-chosen', index);
//     value = index-1;
//     console.log(index)
// }

const worldStep = 1/60;

const gWorld = new CANNON.World();
gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);
gWorld.gravity.set(0, -10, 0);
gWorld.defaultContactMaterial.friction = 1;
const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer(/*{antialias: true}*/{
    canvas: document.querySelector('.webgl')
});

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

gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
gRenderer.setClearColor('#D9AE71')
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
const ambientLight = new THREE.AmbientLight('#706F6F', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 800)
pointLight.position.set(50, 500, -150)
gScene.add(pointLight)
const secondLight = new THREE.PointLight(0xffffff, 1, 1200)
secondLight.position.set(150, 0, 0)
gScene.add(secondLight)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(200, 200, 600, 32),
    new THREE.MeshStandardMaterial({color: '#D9AE71'}),
)
floor.material.side = THREE.DoubleSide
floor.position.y = -300
floor.position.z = 2
gScene.add(floor)

//Floor phys
const floorShape = new CANNON.Cylinder(200, 200, 100, 32)
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    position: new CANNON.Vec3(0, -50, 0),
})
gWorld.addBody(floorBody)


var vehicle
const vehicleInitialPosition = new THREE.Vector3(0, 50, 0);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);
let resetVehicle = () => {};

var gameTp, gameTpBody;

var pontGallery, pontGalleryBody

var pupitreArtists, pupitreArtistsBody, textNomin

var ceremonie, theatreBodyPart1, theatreBodyPart2, ceremonieBody, barriere1, barriere2, ecranCeremonie;

var IUT, IUTPhys;

var appareil, appareilPhys;

var mentionsBody;
var mentionsLength = 20;
var mentionsZ = 8;
var planeEnter;

// var commandes;

if ("ontouchstart" in document.documentElement){
    document.getElementById('commande').classList.add("hidden")
}

(async function init() {

    const [wheelGLTF, chassisGLTF, /*gameTpGLTF,*/ pontGalleryGLTF, pupitreArtistsGLTF, theatreGLTF, hansonJSON, SolGLTF, /*CommandesPNG,*/ visuelFestivalPNG, iutGLTF, appareilGLTF] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        // utils.loadResource('model/teleport_game.gltf'),
        utils.loadResource('model/Pont.gltf'),
        utils.loadResource('model/Pupitre.gltf'),
        utils.loadResource('model/theatre.gltf'),
        utils.loadResource('fonts/Hanson_Bold.json'),
        utils.loadResource('model/petits_cailloux.gltf'),
        // utils.loadResource('image/Commandes_site.png'),
        utils.loadResource('image/banniere.png'),
        utils.loadResource('model/test_iut.gltf'),
        utils.loadResource('model/appareil_photo.gltf'),
    ]);

    const wheel = wheelGLTF.scene;
    const chassis = chassisGLTF.scene;

    /**
     * Appareil Photo Anciens
     */
    // Modèle 3D
    appareil = appareilGLTF.scene
    appareil.scale.set(5, 5, 5)
    appareil.position.set(-185, 12, 0)
    appareil.rotation.y = -Math.PI*0.05
    gScene.add(appareil)

    // Physique
    // const objPhys = new CANNON.Box(new CANNON.Vec3(12, 5, 5))
    // appareilPhys = new CANNON.Body({mass: 0})
    // appareilPhys.addShape(objPhys, new CANNON.Vec3(0, 12, 0))
    // appareilPhys.rotation = new CANNON.Vec3(0, 0, Math.PI*0.5)
    // appareilPhys.position.x = -25
    // // appareilPhys.position.x = appareil.position.x
    // gWorld.addBody(appareilPhys)


    /**
     * Cube IUT
     */
    // Modèle 3D
    IUT = iutGLTF.scene
    IUT.rotation.y = Math.PI
    IUT.position.set(185,1,0)
    IUT.scale.set(3, 3, 3)
    gScene.add(IUT)

    // Physique
    const iutPhys = new CANNON.Box(new CANNON.Vec3(12, 12, 12))
    IUTPhys = new CANNON.Body({
        mass: 0, 
        shape: iutPhys,
        position: new CANNON.Vec3(185, 12, 0)
    })
    gWorld.addBody(IUTPhys)

    
    /**
     * Game Island
     */
    // Téléporteur vers les iles
    // gameTp = gameTpGLTF.scene;
    // gameTp.position.set(7, 1.8, 12)
    // gameTp.scale.set(11, 11, 11)
    // gScene.add(gameTp)

    // Teleport Game phys
    // const gameTpShape = new CANNON.Box(new CANNON.Vec3(11, 11, 11))
    // gameTpBody = new CANNON.Body({
    //     mass: 1000,
    //     position: new CANNON.Vec3(100, 22, 150),
    //     shape: gameTpShape,
    //     quaternion: new CANNON.Quaternion(1, 0, -0.5)
    // })
    // gWorld.addBody(gameTpBody)



    /**
     * Décos
     */
    const cailloux = SolGLTF.scene
    const caillouxMaterial = new THREE.MeshStandardMaterial({color: '#2D2B27'})
    cailloux.scale.set(0.1, 0.1, 0.02)
    cailloux.rotation.x = -Math.PI*0.5
    var deco = [
        cailloux,
        cailloux.clone()
    ]
    deco[1].scale.set(0.3, 0.3, 0.3)
    deco.forEach(function(item, index){
        deco[index].traverse( function ( node ) {

            if ( node.isMesh ){
                node.material = caillouxMaterial;
            }
        
          } );
    })

    var display = [
        deco[1].children[2],
        deco[1].children[0],
        deco[1].children[1],
        deco[1].children[3],
        deco[1].children[4],
        deco[1].children[5],
        deco[0].children[0]
    ]

    display[6].position.set(100, 0.001, 10)
    display[6].scale.set(5, 5, 0.5)

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
        display[index].rotateX(-Math.PI*0.5)
        gScene.add(display[index])
    })

    /**
     * Mentions légales
     */
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
    

    /**
     * Cérémonie
     */
    // Modèle 3D
    ceremonie = theatreGLTF.scene
    ceremonie.scale.set(8, 8, 8)
    ceremonie.position.set(-100, 0, -90)
    ceremonie.rotation.y = Math.PI*0.7
    gScene.add(ceremonie)

    ecranCeremonie = new THREE.Mesh(
        new THREE.PlaneGeometry(76, 40),
        new THREE.MeshBasicMaterial({map: visuelFestivalPNG})
    )
    ecranCeremonie.position.set(ceremonie.position.x-20, 55, ceremonie.position.z-30)
    ecranCeremonie.rotateY(Math.PI*0.2)
    gScene.add(ecranCeremonie)

    // Collider théatre
    const theatreShape = new CANNON.Box(new CANNON.Vec3(30,15,25))
    theatreBodyPart1 = new CANNON.Body({
        mass: 0,
        shape: theatreShape,
        position: new CANNON.Vec3(-190, 10, -132),
    })
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
    })
    gWorld.addBody(ceremonieBody)

    /**
     * Nommés
     */
    // Modèle 3D
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

    // Collider vers la page des nommés
    const collideArtistsShape = new CANNON.Box(new CANNON.Vec3(5,5,5))
    const collideArtists = new CANNON.Body({
        mass: 0,
        shape: collideArtistsShape,
        position: new CANNON.Vec3(120, 20, -130),
    })
    gWorld.addBody(collideArtists)

    // Texte des nommés
    const textNominGeometry = new THREE.TextGeometry(
        'Les nommés',
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

/**
 * Galerie
 */
    // Modèle 3D
    pontGallery = pontGalleryGLTF.scene
    pontGallery.scale.set(3.3, 3.3, 3.3)
    pontGallery.rotation.set(0, - Math.PI*0.3, 0)
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
    var interactable = [collideGallery, collideArtists, ceremonieBody, mentionsBody, IUTPhys]
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

    /**
     * Game Island Update
     */
    // gameTp.position.copy(gameTpBody.position)
    // gameTp.quaternion.copy(gameTpBody.quaternion)

    /**
     * Nommés Update
     */
    pupitreArtists.position.copy(pupitreArtistsBody.position)
    pupitreArtists.position.y = 0

    /**
     * Cérémonie Update
     */
    barriere1.quaternion.copy(ceremonie.quaternion)
    barriere2.quaternion.copy(ceremonie.quaternion)
    ceremonieBody.quaternion.copy(ceremonie.quaternion)
    theatreBodyPart1.quaternion.copy(ceremonie.quaternion)
    theatreBodyPart2.quaternion.copy(ceremonie.quaternion)

    /**
     * Galerie Update
     */
    pontGallery.position.copy(pontGalleryBody.position)

    /**
     * Mentions légales Update
     */
    // if(vehicle.chassisBody.position.x >= mentionsBody.position.x - (mentionsLength) && vehicle.chassisBody.position.x <= mentionsBody.position.x + (mentionsLength) && vehicle.chassisBody.position.z >= mentionsBody.position.z - (mentionsZ) && vehicle.chassisBody.position.z <= mentionsBody.position.z + (mentionsZ)){
    //     gScene.add(planeEnter)
    //     gsap.to(planeEnter.position, {duration: 0.2, y: 6})
        
    // } else{
    //     if(gScene.getObjectByName("Mentions")){
    //         gsap.to(planeEnter.position, {duration: 0.15, y: -1})
    //         setTimeout(function(){
    //             gScene.remove(planeEnter)
    //         }, 150)
    //     }
    // }

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
        case 'ENTER':
            if(gScene.getObjectByName("Mentions")){
                // window.location.pathname = "./immersions/mentions_legales.html"
                window.location.pathname = "./mentions_legales.html"
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