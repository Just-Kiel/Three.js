import '../style/main.css'
// import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import * as utils from '../utils.js';
// import createVehicle from '../raycastVehicle.js';
import {cameraHelper} from '../cameraHelper.js';
import gsap from 'gsap'
// import cannonDebugger from 'cannon-es-debugger'

const worldStep = 1/60;

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

camera.position.y = 40
camera.position.z = 90
gScene.add(camera)


let wireframeRenderer = null;
let pause = false;


const ambientLight = new THREE.AmbientLight('#686868', 1);
gScene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 1000)
pointLight.position.set(50, 500, 150)
gScene.add(pointLight)


gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);


const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2();

var cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6
var cardMultimedia1, cardMultimedia2, cardMultimedia3
var cardCom1, cardCom2, cardCom3
var cardInfo1, cardInfo2, cardInfo3
var cardAudio1, cardAudio2, cardAudio3
var cardWeb1, cardWeb2, cardWeb3
var cardAnim1, cardAnim2, cardAnim3
var backCard

var coordNomin1 = [-20, -26, 0];
var coordNomin2 = [0, -25, 0];
var coordNomin3 = [20, -27, 0];
var rotatNomin = [Math.PI * 0.05, , - Math.PI * 0.05];
var heightCard = 50;
var heightArtist = -25;
var coordCategoryCard = [-75, -45, -15, 15, 45, 75];




(async function init() {

    const [MultimediaPNG, CommunicationPNG, InfographiePNG, AudiovisuelPNG, WebPNG, AnimationPNG,
            backCardPNG,
            nomine1MultimediaPNG, nomine2MultimediaPNG, nomine3MultimediaPNG,
            nomine1CommunicationPNG, nomine2CommunicationPNG, nomine3CommunicationPNG,
            nomine1InfographiePNG, nomine2InfographiePNG, nomine3InfographiePNG,
            nomine1AudiovisuelPNG, nomine2AudiovisuelPNG, nomine3AudiovisuelPNG,
            nomine1WebPNG, nomine2WebPNG, nomine3WebPNG,
            nomine1AnimationPNG, nomine2AnimationPNG, nomine3AnimationPNG
        ] = await Promise.all([
        utils.loadResource('image/artists/multimedia/multimedia.png'),
        utils.loadResource('image/artists/communication/communication.png'),
        utils.loadResource('image/artists/infographie/infographie.png'),
        utils.loadResource('image/artists/audiovisuel/audiovisuel.png'),
        utils.loadResource('image/artists/web/web.png'),
        utils.loadResource('image/artists/animation/animation.png'),
        utils.loadResource('image/artists/backCard.png'),
        utils.loadResource('image/artists/multimedia/nomine_1.png'),
        utils.loadResource('image/artists/multimedia/nomine_2.png'),
        utils.loadResource('image/artists/multimedia/nomine_3.png'),
        utils.loadResource('image/artists/communication/nomine_1.png'),
        utils.loadResource('image/artists/communication/nomine_2.png'),
        utils.loadResource('image/artists/communication/nomine_3.png'),
        utils.loadResource('image/artists/infographie/nomine_1.png'),
        utils.loadResource('image/artists/infographie/nomine_2.png'),
        utils.loadResource('image/artists/infographie/nomine_3.png'),
        utils.loadResource('image/artists/audiovisuel/nomine_1.png'),
        utils.loadResource('image/artists/audiovisuel/nomine_2.png'),
        utils.loadResource('image/artists/audiovisuel/nomine_3.png'),
        utils.loadResource('image/artists/web/nomine_1.png'),
        utils.loadResource('image/artists/web/nomine_2.png'),
        utils.loadResource('image/artists/web/nomine_3.png'),
        utils.loadResource('image/artists/animation/nomine_1.png'),
        utils.loadResource('image/artists/animation/nomine_2.png'),
        utils.loadResource('image/artists/animation/nomine_3.png'),
    ]);

    // Cartes catégories
    const cardGeometry = new THREE.PlaneGeometry(29.5, 45.5)
    cardCategory1 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: MultimediaPNG}),
        // new THREE.MeshStandardMaterial({color: '#ABEDC6'}),
    )
    cardCategory1.name = "Multimédia"
    cardCategory1.position.set(coordCategoryCard[0], heightCard, 0)
    // cardCategory1.rotation.z = Math.PI * 0.1

    cardCategory2 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: CommunicationPNG})
        // new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    cardCategory2.name = "Communication"
    cardCategory2.position.set(coordCategoryCard[1], heightCard, 0)
    // cardCategory2.rotation.z = Math.PI * 0.05

    cardCategory3 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: InfographiePNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardCategory3.name = "Infographie"
    cardCategory3.position.set(coordCategoryCard[2], heightCard, 0)
    // cardCategory3.rotation.z = Math.PI * 0.02

    cardCategory4 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: AudiovisuelPNG})
        // new THREE.MeshStandardMaterial({color: '#ABEDC6'})
    )
    cardCategory4.name = "Audiovisuel"
    cardCategory4.position.set(coordCategoryCard[3], heightCard, 0)
    // cardCategory4.rotation.z = - Math.PI * 0.02
    
    cardCategory5 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: WebPNG})
        // new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    cardCategory5.name = "Site Web"
    cardCategory5.position.set(coordCategoryCard[4], heightCard, 0)
    // cardCategory5.rotation.z = - Math.PI * 0.05
    
    cardCategory6 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: AnimationPNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardCategory6.name = "Animation"
    cardCategory6.position.set(coordCategoryCard[5], heightCard, 0)
    // cardCategory6.rotation.z = - Math.PI * 0.1

    gScene.add(cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6)

    backCard = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: backCardPNG})
        // new THREE.MeshStandardMaterial({color: '#ECF0F1'})
    )
    backCard.position.set(0, 50, -1)
    backCard.rotation.y = -3

    // Cartes nominés multimédia
    cardMultimedia1 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine1MultimediaPNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardMultimedia1.name = "Multimédia Nominé 1"
    cardMultimedia1.position.set(0, heightArtist, 0)
    // cardMultimedia1.rotation.z = rotatNomin[0]
    cardMultimedia1.rotation.y = -3

    cardMultimedia2 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine2MultimediaPNG})
        // new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    cardMultimedia2.name = "Nominé 2"
    cardMultimedia2.position.set(0, heightArtist, 0)
    cardMultimedia2.rotation.y = -3

    cardMultimedia3 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine3MultimediaPNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardMultimedia3.name = "Nominé 3"
    cardMultimedia3.position.set(0, heightArtist, 0)
    cardMultimedia3.rotation.y = -3
    // cardMultimedia3.rotation.z = rotatNomin[2]
    
    // Cartes nominés Communication
    cardCom1 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine1CommunicationPNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardCom1.name = "Communication Nominé 1"
    cardCom1.position.set(0, heightArtist, 0)
    cardCom1.rotation.y = -3
    // cardCom1.rotation.z = rotatNomin[0]

    cardCom2 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine2CommunicationPNG})
        // new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    cardCom2.name = "Nominé 2"
    cardCom2.position.set(0, heightArtist, 0)
    cardCom2.rotation.y = -3

    cardCom3 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine3CommunicationPNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardCom3.name = "Nominé 3"
    cardCom3.position.set(0, heightArtist, 0)
    // cardCom3.rotation.z = rotatNomin[2]
    cardCom3.rotation.y = -3
    
    // Cartes nominés Infographie
    cardInfo1 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine1InfographiePNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardInfo1.name = "Infographie Nominé 1"
    cardInfo1.position.set(0, heightArtist, 0)
    // cardInfo1.rotation.z = rotatNomin[0]
    cardInfo1.rotation.y = -3

    cardInfo2 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine2InfographiePNG})
        // new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    cardInfo2.name = "Nominé 2"
    cardInfo2.position.set(0, heightArtist, 0)
    cardInfo2.rotation.y = -3

    cardInfo3 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine3InfographiePNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardInfo3.name = "Nominé 3"
    cardInfo3.position.set(0, heightArtist, 0)
    // cardInfo3.rotation.z = rotatNomin[2]
    cardInfo3.rotation.y = -3
    
    // Cartes nominés Audiovisuel
    cardAudio1 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine1AudiovisuelPNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardAudio1.name = "Audiovisuel Nominé 1"
    cardAudio1.position.set(0, heightArtist, 0)
    // cardAudio1.rotation.z = rotatNomin[0]
    cardAudio1.rotation.y = -3

    cardAudio2 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine2AudiovisuelPNG})
        // new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    cardAudio2.name = "Nominé 2"
    cardAudio2.position.set(0, heightArtist, 0)
    cardAudio2.rotation.y = -3

    cardAudio3 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine3AudiovisuelPNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardAudio3.name = "Nominé 3"
    cardAudio3.position.set(0, heightArtist, 0)
    // cardAudio3.rotation.z = rotatNomin[2]
    cardAudio3.rotation.y = -3
    
    // Cartes nominés Site Web
    cardWeb1 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine1WebPNG})
        // new THREE.MeshStandardMaterial({color: '#E8A7BE'})
    )
    cardWeb1.name = "Site Web Nominé 1"
    cardWeb1.position.set(0, heightArtist, 0)
    // cardWeb1.rotation.z = rotatNomin[0]
    cardWeb1.rotation.y = -3

    cardWeb2 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine2WebPNG})
        // new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    cardWeb2.name = "Nominé 2"
    cardWeb2.position.set(0, heightArtist, 0)
    cardWeb2.rotation.y = -3

    cardWeb3 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine3WebPNG})
        // new THREE.MeshStandardMaterial({color: '#E8AABE'})
    )
    cardWeb3.name = "Nominé 3"
    cardWeb3.position.set(0, heightArtist, 0)
    // cardWeb3.rotation.z = rotatNomin[2]
    cardWeb3.rotation.y = -3
    
    // Cartes nominés Animation
    cardAnim1 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine1AnimationPNG})
        // new THREE.MeshStandardMaterial({color: '#D46F4D'})
    )
    cardAnim1.name = "Animation Nominé 1"
    cardAnim1.position.set(0, heightArtist, 0)
    // cardAnim1.rotation.z = rotatNomin[0]
    cardAnim1.rotation.y = -3

    cardAnim2 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine2AnimationPNG})
        // new THREE.MeshStandardMaterial({color: '#FFBF66'})
    )
    cardAnim2.name = "Nominé 2"
    cardAnim2.position.set(0, heightArtist, 0)
    cardAnim2.rotation.y = -3

    cardAnim3 = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshStandardMaterial({map: nomine3AnimationPNG})
        // new THREE.MeshStandardMaterial({color: '#08C5D1'})
    )
    cardAnim3.name = "Nominé 3"
    cardAnim3.position.set(0, heightArtist, 0)
    // cardAnim3.rotation.z = rotatNomin[2]
    cardAnim3.rotation.y = -3


    // cameraHelper.init(camera, chassis, gRenderer.domElement, 2);
    
    render();
})();

function updatePhysics() {
    // gWorld.step(worldStep);
}

let currentIntersect = null
let currentArtist = null

let mouseCursor = document.querySelector("#cursor")
window.addEventListener( 'mousemove', onMouseMove, false );
function onMouseMove(event){
    mouseCursor.style.top = event.clientY + "px"
    mouseCursor.style.left = event.clientX + "px"
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) *2 +1;
}


var intersects
var artistesClicked = false;
var currentArtistsClicked = [];


window.addEventListener('click', () => {
    document.getElementById("hub_arrow").onclick = function(){
        window.location.pathname = "./immersions/index.html";
        // window.location.pathname = "./index.html";
    }
    if(document.getElementById("cursor").classList.contains('cross')){
        document.getElementById("cursor").classList.remove("cross")
    }else
    if(currentIntersect){
        
        document.getElementById("arrow").onclick = function(){
            gsap.to(currentArtistsClicked[0].position, {duration: 1, x:0, y:heightArtist, z: coordNomin1[2]})
            gsap.to(currentArtistsClicked[0].rotation, {duration: 1, z:0})
            gsap.to(currentArtistsClicked[1].position, {duration: 1, x:0, y:heightArtist, z: coordNomin2[2]})
            gsap.to(currentArtistsClicked[2].position, {duration: 1, x:0, y:heightArtist, z: coordNomin3[2]})
            gsap.to(currentArtistsClicked[2].rotation, {duration: 1, z:0})
            document.getElementById("arrow").classList.add("hidden")

            setTimeout(function(){
                gScene.add(backCard);
                gsap.to(backCard.rotation, {duration: 1, y: 0})
                gsap.to(backCard.position, {duration: 1, z: 1})
                gsap.to(currentArtistsClicked[0].rotation, {duration: 1, y: -3})
                gsap.to(currentArtistsClicked[1].rotation, {duration: 1, y: -3})
                gsap.to(currentArtistsClicked[2].rotation, {duration: 1, y: -3})
                document.getElementById("hub_arrow").classList.remove("hidden")
            }, 1000)

            setTimeout(function(){
                gScene.remove(currentArtistsClicked[0], currentArtistsClicked[1], currentArtistsClicked[2])
                gsap.to(backCard.position, {duration: 1, y:heightCard})
            }, 2000)
            setTimeout(function(){
                gScene.add(cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6)
                gsap.to(backCard.rotation, {duration: 1, y:-3})
                gsap.to(backCard.position, {duration: 1, z: -1})
                gsap.to(cardCategory1.rotation, {duration: 1, y:0, z:0})
                gsap.to(cardCategory2.rotation, {duration: 1, y:0, z:0})
                gsap.to(cardCategory3.rotation, {duration: 1, y:0, z:0})
                gsap.to(cardCategory4.rotation, {duration: 1, y:0, z:0})
                gsap.to(cardCategory5.rotation, {duration: 1, y:0, z:0})
                gsap.to(cardCategory6.rotation, {duration: 1, y:0, z:0})
            }, 3000)

            setTimeout(function(){
                gScene.remove(backCard)
                gsap.to(cardCategory1.position, {duration: 1, x: coordCategoryCard[0]})
                gsap.to(cardCategory2.position, {duration: 1, x: coordCategoryCard[1]})
                gsap.to(cardCategory3.position, {duration: 1, x: coordCategoryCard[2]})
                gsap.to(cardCategory4.position, {duration: 1, x: coordCategoryCard[3]})
                gsap.to(cardCategory5.position, {duration: 1, x: coordCategoryCard[4]})
                gsap.to(cardCategory6.position, {duration: 1, x: coordCategoryCard[5]})
                artistesClicked = false
                
            }, 4000)
        }
        if(currentIntersect.object.name == "Multimédia")
        {
            document.getElementById("hub_arrow").classList.add("hidden")
            document.getElementById("arrow").classList.remove("hidden")
            gScene.add(backCard);
            gsap.to(cardCategory1.position, {duration: 1, x: 0, y:50, z:0.01})
            gsap.to(cardCategory2.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory3.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory4.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory5.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory6.position, {duration: 1, x: 0, y:50})

            setTimeout(function(){
                gsap.to(backCard.rotation, {duration: 1, y: 0})
                gsap.to(backCard.position, {duration: 1, z: 1})
                gsap.to(cardCategory1.rotation, {duration: 1, y:3})
                gsap.to(cardCategory2.rotation, {duration: 1, y:3})
                gsap.to(cardCategory3.rotation, {duration: 1, y:3})
                gsap.to(cardCategory4.rotation, {duration: 1, y:3})
                gsap.to(cardCategory5.rotation, {duration: 1, y:3})
                gsap.to(cardCategory6.rotation, {duration: 1, y:3})
            }, 1000)

            setTimeout(function(){
                gScene.remove(cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6);
                gsap.to(backCard.position, {duration: 1, y: -25})
            }, 2000)

            setTimeout(function(){
                gScene.add(cardMultimedia1, cardMultimedia2, cardMultimedia3)
                currentArtistsClicked = [cardMultimedia1, cardMultimedia2, cardMultimedia3]
                gsap.to(backCard.rotation, {duration:1, y:3})
                gsap.to(cardMultimedia1.rotation, {duration: 1, y:0})
                gsap.to(cardMultimedia2.rotation, {duration: 1, y:0})
                gsap.to(cardMultimedia3.rotation, {duration: 1, y:0})
            }, 3000)

            setTimeout(function(){
                gScene.remove(backCard)
                gsap.to(cardMultimedia1.position, {duration: 1, x: coordNomin1[0], y: coordNomin1[1], z: coordNomin1[2]})
                gsap.to(cardMultimedia1.rotation, {duration: 1, z: rotatNomin[0]})
                gsap.to(cardMultimedia2.position, {duration: 1, x: coordNomin2[0], y: coordNomin2[1], z: coordNomin2[2]})
                gsap.to(cardMultimedia3.position, {duration: 1, x: coordNomin3[0], y: coordNomin3[1], z: coordNomin3[2]})
                gsap.to(cardMultimedia3.rotation, {duration: 1, z: rotatNomin[2]})
            }, 4000)

            
        } else if(currentIntersect.object.name == "Communication")
        {
            document.getElementById("hub_arrow").classList.add("hidden")
            document.getElementById("arrow").classList.remove("hidden")
            gScene.add(backCard);
            gsap.to(cardCategory1.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory2.position, {duration: 1, x: 0, y:50, z:0.01})
            gsap.to(cardCategory3.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory4.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory5.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory6.position, {duration: 1, x: 0, y:50})

            setTimeout(function(){
                gsap.to(backCard.rotation, {duration: 1, y: 0})
                gsap.to(backCard.position, {duration: 1, z: 1})
                gsap.to(cardCategory1.rotation, {duration: 1, y:3})
                gsap.to(cardCategory2.rotation, {duration: 1, y:3})
                gsap.to(cardCategory3.rotation, {duration: 1, y:3})
                gsap.to(cardCategory4.rotation, {duration: 1, y:3})
                gsap.to(cardCategory5.rotation, {duration: 1, y:3})
                gsap.to(cardCategory6.rotation, {duration: 1, y:3})
            }, 1000)

            setTimeout(function(){
                gScene.remove(cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6);
                gsap.to(backCard.position, {duration: 1, y: -25})
            }, 2000)

            setTimeout(function(){
                gScene.add(cardCom1, cardCom2, cardCom3)
                currentArtistsClicked = [cardCom1, cardCom2, cardCom3]
                gsap.to(backCard.rotation, {duration:1, y:3})
                gsap.to(cardCom1.rotation, {duration: 1, y:0})
                gsap.to(cardCom2.rotation, {duration: 1, y:0})
                gsap.to(cardCom3.rotation, {duration: 1, y:0})
            }, 3000)

            setTimeout(function(){
                gScene.remove(backCard)
                gsap.to(cardCom1.position, {duration: 1, x: coordNomin1[0], y: coordNomin1[1], z: coordNomin1[2]})
                gsap.to(cardCom1.rotation, {duration: 1, z: rotatNomin[0]})
                gsap.to(cardCom2.position, {duration: 1, x: coordNomin2[0], y: coordNomin2[1], z: coordNomin2[2]})
                gsap.to(cardCom3.position, {duration: 1, x: coordNomin3[0], y: coordNomin3[1], z: coordNomin3[2]})
                gsap.to(cardCom3.rotation, {duration: 1, z: rotatNomin[2]})
            }, 4000)

        } else if(currentIntersect.object.name == "Infographie"){
            document.getElementById("hub_arrow").classList.add("hidden")
            document.getElementById("arrow").classList.remove("hidden")
            gScene.add(backCard);
            gsap.to(cardCategory1.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory2.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory3.position, {duration: 1, x: 0, y:50, z:0.01})
            gsap.to(cardCategory4.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory5.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory6.position, {duration: 1, x: 0, y:50})

            setTimeout(function(){
                gsap.to(backCard.rotation, {duration: 1, y: 0})
                gsap.to(backCard.position, {duration: 1, z: 1})
                gsap.to(cardCategory1.rotation, {duration: 1, y:3})
                gsap.to(cardCategory2.rotation, {duration: 1, y:3})
                gsap.to(cardCategory3.rotation, {duration: 1, y:3})
                gsap.to(cardCategory4.rotation, {duration: 1, y:3})
                gsap.to(cardCategory5.rotation, {duration: 1, y:3})
                gsap.to(cardCategory6.rotation, {duration: 1, y:3})
            }, 1000)

            setTimeout(function(){
                gScene.remove(cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6);
                gsap.to(backCard.position, {duration: 1, y: -25})
            }, 2000)

            setTimeout(function(){
                gScene.add(cardInfo1, cardInfo2, cardInfo3)
                currentArtistsClicked = [cardInfo1, cardInfo2, cardInfo3]
                gsap.to(backCard.rotation, {duration:1, y:3})
                gsap.to(cardInfo1.rotation, {duration: 1, y:0})
                gsap.to(cardInfo2.rotation, {duration: 1, y:0})
                gsap.to(cardInfo3.rotation, {duration: 1, y:0})
            }, 3000)

            setTimeout(function(){
                gScene.remove(backCard)
                gsap.to(cardInfo1.position, {duration: 1, x: coordNomin1[0], y: coordNomin1[1], z: coordNomin1[2]})
                gsap.to(cardInfo1.rotation, {duration: 1, z: rotatNomin[0]})
                gsap.to(cardInfo2.position, {duration: 1, x: coordNomin2[0], y: coordNomin2[1], z: coordNomin2[2]})
                gsap.to(cardInfo3.position, {duration: 1, x: coordNomin3[0], y: coordNomin3[1], z: coordNomin3[2]})
                gsap.to(cardInfo3.rotation, {duration: 1, z: rotatNomin[2]})
            }, 4000)

        } else if(currentIntersect.object.name == "Audiovisuel"){
            document.getElementById("hub_arrow").classList.add("hidden")
            document.getElementById("arrow").classList.remove("hidden")
            gScene.add(backCard);
            gsap.to(cardCategory1.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory2.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory3.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory4.position, {duration: 1, x: 0, y:50, z:0.01})
            gsap.to(cardCategory5.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory6.position, {duration: 1, x: 0, y:50})

            setTimeout(function(){
                gsap.to(backCard.rotation, {duration: 1, y: 0})
                gsap.to(backCard.position, {duration: 1, z: 1})
                gsap.to(cardCategory1.rotation, {duration: 1, y:3})
                gsap.to(cardCategory2.rotation, {duration: 1, y:3})
                gsap.to(cardCategory3.rotation, {duration: 1, y:3})
                gsap.to(cardCategory4.rotation, {duration: 1, y:3})
                gsap.to(cardCategory5.rotation, {duration: 1, y:3})
                gsap.to(cardCategory6.rotation, {duration: 1, y:3})
            }, 1000)

            setTimeout(function(){
                gScene.remove(cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6);
                gsap.to(backCard.position, {duration: 1, y: -25})
            }, 2000)

            setTimeout(function(){
                gScene.add(cardAudio1, cardAudio2, cardAudio3)
                currentArtistsClicked = [cardAudio1, cardAudio2, cardAudio3]
                gsap.to(backCard.rotation, {duration:1, y:3})
                gsap.to(cardAudio1.rotation, {duration: 1, y:0})
                gsap.to(cardAudio2.rotation, {duration: 1, y:0})
                gsap.to(cardAudio3.rotation, {duration: 1, y:0})
            }, 3000)

            setTimeout(function(){
                gScene.remove(backCard)
                gsap.to(cardAudio1.position, {duration: 1, x: coordNomin1[0], y: coordNomin1[1], z: coordNomin1[2]})
                gsap.to(cardAudio1.rotation, {duration: 1, z: rotatNomin[0]})
                gsap.to(cardAudio2.position, {duration: 1, x: coordNomin2[0], y: coordNomin2[1], z: coordNomin2[2]})
                gsap.to(cardAudio3.position, {duration: 1, x: coordNomin3[0], y: coordNomin3[1], z: coordNomin3[2]})
                gsap.to(cardAudio3.rotation, {duration: 1, z: rotatNomin[2]})
            }, 4000)
        }else if(currentIntersect.object.name == "Site Web"){
            document.getElementById("hub_arrow").classList.add("hidden")
            document.getElementById("arrow").classList.remove("hidden")
            gScene.add(backCard);
            gsap.to(cardCategory1.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory2.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory3.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory4.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory5.position, {duration: 1, x: 0, y:50, z:0.01})
            gsap.to(cardCategory6.position, {duration: 1, x: 0, y:50})

            setTimeout(function(){
                gsap.to(backCard.rotation, {duration: 1, y: 0})
                gsap.to(backCard.position, {duration: 1, z: 1})
                gsap.to(cardCategory1.rotation, {duration: 1, y:3})
                gsap.to(cardCategory2.rotation, {duration: 1, y:3})
                gsap.to(cardCategory3.rotation, {duration: 1, y:3})
                gsap.to(cardCategory4.rotation, {duration: 1, y:3})
                gsap.to(cardCategory5.rotation, {duration: 1, y:3})
                gsap.to(cardCategory6.rotation, {duration: 1, y:3})
            }, 1000)

            setTimeout(function(){
                gScene.remove(cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6);
                gsap.to(backCard.position, {duration: 1, y: -25})
            }, 2000)

            setTimeout(function(){
                gScene.add(cardWeb1, cardWeb2, cardWeb3)
                currentArtistsClicked = [cardWeb1, cardWeb2, cardWeb3]
                gsap.to(backCard.rotation, {duration:1, y:3})
                gsap.to(cardWeb1.rotation, {duration: 1, y:0})
                gsap.to(cardWeb2.rotation, {duration: 1, y:0})
                gsap.to(cardWeb3.rotation, {duration: 1, y:0})
            }, 3000)

            setTimeout(function(){
                gScene.remove(backCard)
                gsap.to(cardWeb1.position, {duration: 1, x: coordNomin1[0], y: coordNomin1[1], z: coordNomin1[2]})
                gsap.to(cardWeb1.rotation, {duration: 1, z: rotatNomin[0]})
                gsap.to(cardWeb2.position, {duration: 1, x: coordNomin2[0], y: coordNomin2[1], z: coordNomin2[2]})
                gsap.to(cardWeb3.position, {duration: 1, x: coordNomin3[0], y: coordNomin3[1], z: coordNomin3[2]})
                gsap.to(cardWeb3.rotation, {duration: 1, z: rotatNomin[2]})
            }, 4000)
        }else if(currentIntersect.object.name == "Animation"){
            document.getElementById("hub_arrow").classList.add("hidden")
            document.getElementById("arrow").classList.remove("hidden")
            gScene.add(backCard);
            gsap.to(cardCategory1.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory2.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory3.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory4.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory5.position, {duration: 1, x: 0, y:50})
            gsap.to(cardCategory6.position, {duration: 1, x: 0, y:50, z:0.01})

            setTimeout(function(){
                gsap.to(backCard.rotation, {duration: 1, y: 0})
                gsap.to(backCard.position, {duration: 1, z: 1})
                gsap.to(cardCategory1.rotation, {duration: 1, y:3})
                gsap.to(cardCategory2.rotation, {duration: 1, y:3})
                gsap.to(cardCategory3.rotation, {duration: 1, y:3})
                gsap.to(cardCategory4.rotation, {duration: 1, y:3})
                gsap.to(cardCategory5.rotation, {duration: 1, y:3})
                gsap.to(cardCategory6.rotation, {duration: 1, y:3})
            }, 1000)

            setTimeout(function(){
                gScene.remove(cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory5, cardCategory6);
                gsap.to(backCard.position, {duration: 1, y: -25})
            }, 2000)

            setTimeout(function(){
                gScene.add(cardAnim1, cardAnim2, cardAnim3)
                currentArtistsClicked = [cardAnim1, cardAnim2, cardAnim3]
                gsap.to(backCard.rotation, {duration:1, y:3})
                gsap.to(cardAnim1.rotation, {duration: 1, y:0})
                gsap.to(cardAnim2.rotation, {duration: 1, y:0})
                gsap.to(cardAnim3.rotation, {duration: 1, y:0})
            }, 3000)

            setTimeout(function(){
                gScene.remove(backCard)
                gsap.to(cardAnim1.position, {duration: 1, x: coordNomin1[0], y: coordNomin1[1], z: coordNomin1[2]})
                gsap.to(cardAnim1.rotation, {duration: 1, z: rotatNomin[0]})
                gsap.to(cardAnim2.position, {duration: 1, x: coordNomin2[0], y: coordNomin2[1], z: coordNomin2[2]})
                gsap.to(cardAnim3.position, {duration: 1, x: coordNomin3[0], y: coordNomin3[1], z: coordNomin3[2]})
                gsap.to(cardAnim3.rotation, {duration: 1, z: rotatNomin[2]})
            }, 4000)
        } else{
            gsap.to(currentIntersect.object.position, {duration: 1, x: 0, y: 45, z:50})
            gsap.to(currentIntersect.object.rotation, {duration: 1, z: 0})
            artistesClicked = true
            if(currentArtist && currentArtist != currentIntersect){
                if(currentArtist.object.name == "Nominé 3"){
                gsap.to(currentArtist.object.position, {duration: 1, x: coordNomin3[0], y:coordNomin3[1], z: coordNomin3[2]})
                gsap.to(currentArtist.object.rotation, {duration: 1, z: rotatNomin[2]})
                } else if(currentArtist.object.name == "Nominé 2"){
                gsap.to(currentArtist.object.position, {duration: 1, x: coordNomin2[0], y:coordNomin2[1], z: coordNomin2[2]})
                } else {
                    gsap.to(currentArtist.object.position, {duration: 1, x: coordNomin1[0], y:coordNomin1[1], z: coordNomin1[2]})
                    gsap.to(currentArtist.object.rotation, {duration: 1, z: rotatNomin[0]})
                }
            }
            currentArtist = currentIntersect
        }
        // document.getElementById("cursor").classList.add("cross")
    }
})

function render() {
    if(document.getElementById("load").classList.contains("hidden")){
    const categoryToTest = [cardCategory1, cardCategory2, cardCategory3, cardCategory4, cardCategory4, cardCategory5, cardCategory6];
    const multimediaToTest = [cardMultimedia1, cardMultimedia2, cardMultimedia3]
    const communicationToTest = [cardCom1, cardCom2, cardCom3]
    const infographieToTest = [cardInfo1, cardInfo2, cardInfo3]
    const audiovisuelToTest = [cardAudio1, cardAudio2, cardAudio3]
    const webToTest = [cardWeb1, cardWeb2, cardWeb3]
    const animationToTest = [cardAnim1, cardAnim2, cardAnim3]

    

    raycaster.setFromCamera(mouse, camera)

    if(gScene.getObjectByName("Multimédia Nominé 1")){
        intersects = raycaster.intersectObjects(multimediaToTest)
    } else if(gScene.getObjectByName("Communication Nominé 1")){
        intersects = raycaster.intersectObjects(communicationToTest)
    } else if(gScene.getObjectByName("Infographie Nominé 1")){
        intersects = raycaster.intersectObjects(infographieToTest)
    }else if(gScene.getObjectByName("Audiovisuel Nominé 1")){
        intersects = raycaster.intersectObjects(audiovisuelToTest)
    }else if(gScene.getObjectByName("Site Web Nominé 1")){
        intersects = raycaster.intersectObjects(webToTest)
    }else if(gScene.getObjectByName("Animation Nominé 1")){
        intersects = raycaster.intersectObjects(animationToTest)
    }else{
        intersects = raycaster.intersectObjects(categoryToTest);
    }

    // if(currentArtist != currentIntersect || currentArtist == null){
    if(intersects.length){
        // console.log(currentArtist)

        if(!currentIntersect && !artistesClicked){
            console.log('mouse enter')
            
            intersects[0].object.translateZ(5)
            // intersects[0].object.translateZ(1)
        }

        if(currentIntersect && currentIntersect.object.name !== intersects[0].object.name && !artistesClicked){
            // console.log('change')
            intersects[0].object.translateZ(5)
            // intersects[0].object.translateZ(1)
            currentIntersect.object.translateZ(-5)
            // currentIntersect.object.translateZ(-1)
        }
        
        currentIntersect = intersects[0]
    } else {
        if(currentIntersect && !artistesClicked){

            currentIntersect.object.translateZ(-5)
            // currentIntersect.object.translateZ(-1)
            console.log('mouse leave')
        }
        
        currentIntersect = null
    }
// }

    // for(const object of categoryToTest){
    //     if(!intersects.find(intersect => intersect.object === object)){
    //         object.material.color.set("#ff0000")
    //     }
    // }

    if (pause) {
        return;
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
    // personControls.handleResize()
}

window.onresize = utils.debounce(windowResizeHandler, 500);

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
            break;
    }
});
