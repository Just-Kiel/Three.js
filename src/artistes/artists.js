import '../style/main.scss'
import * as THREE from 'three'
import * as utils from '../utils.js';
import {cameraHelper} from '../cameraHelper.js';
import gsap from 'gsap'
import '../menu.js'

const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer(/*{antialias: true}*/{
    canvas: document.querySelector('.webgl')
});
gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);

const clock = new THREE.Clock()

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
camera.position.y = 40
camera.position.z = 90
gScene.add(camera)

/**
 * Lights
 */
var ambientLight = new THREE.AmbientLight('#686868', 1);
gScene.add(ambientLight);
var pointLight = new THREE.PointLight(0xffffff, 2, 1000);
pointLight.position.set(50, 500, 120);
gScene.add(pointLight);
const bluePointLight = new THREE.PointLight('#0000FF', 4, 400)
bluePointLight.position.set(-100, -50, -50)
gScene.add(bluePointLight)
const redPointLight = new THREE.PointLight('#FF0000', 2, 400)
redPointLight.position.set(100, 0, -50)
gScene.add(redPointLight)


const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2();

var backCard

var heightCard = 50;
var heightArtist = -25;

var fond, planeFond;

var backCardPNG, modelGLTF;

var objetJSON;
var backgroundTextures = []
var categorieTextures = [];
var cardTextures = [];
var cardArtists = [];
var cardCategories = [];
var i = -1;
var total = -1;

var categoriesToTest = [];
var ecartCard = 30;

(async function init() {

    const [varJSON] = await Promise.all([
        utils.loadResource('infos/artists.txt')
    ]);

    objetJSON = JSON.parse(varJSON);

    const cardGeometry = new THREE.PlaneGeometry(29.5, 45.5)

    /**
     * Affichage des éléments en fonction du contenu JSON
     */
    for(var each in objetJSON.categories){
        i++

        // Chargement des fonds de catégorie
        backgroundTextures[i] = await Promise.all([
            utils.loadResource(objetJSON.categories[each].background)
        ]);

        categorieTextures[i] = await Promise.all([
            utils.loadResource(objetJSON.categories[each].texture)
        ]);
        cardCategories[i] = new THREE.Mesh(
            cardGeometry,
            new THREE.MeshBasicMaterial({transparent: true, map: categorieTextures[i][0]}),
        )
        cardCategories[i].name = objetJSON.categories[each].name_cat
        
        // if(objetJSON.categories.length%2 == 0){
            if(cardCategories[i-1]){
                //Placement en fonction de celle de gauche
                cardCategories[i].position.set(cardCategories[i-1].position.x + ecartCard, heightCard, 0)
            } else {
                cardCategories[i].position.set(-((objetJSON.categories.length/2)*ecartCard)+15, heightCard, 0)
            }
        // }

        categoriesToTest[i] = cardCategories[i]
        gScene.add(cardCategories[i])


        for(var artist in objetJSON.categories[each].artists){
            total++
            
            cardTextures[total] = await Promise.all([
                utils.loadResource(objetJSON.categories[each].artists[artist].texture)
            ])
            cardArtists[total] = new THREE.Mesh(
                cardGeometry,
                new THREE.MeshBasicMaterial({transparent: true, map: cardTextures[total][0]}),
            )
        }
    };


    [backCardPNG, modelGLTF] = await Promise.all([
        utils.loadResource('image/artists/backCard.png'),
        utils.loadResource('model/artists.gltf')
    ]);

    /**
     * Déco
     */
    // Modele 3D
    fond = modelGLTF.scene
    fond.scale.set(20, 20, 20)
    fond.position.z = -250
    fond.position.y = -180
    gScene.add(fond)

    // Plane pour décorer
    planeFond = new THREE.Mesh(
        new THREE.PlaneGeometry(1280, 720),
        new THREE.MeshBasicMaterial({opacity: 0, transparent: true})
    )
    planeFond.name = "ecran"
    planeFond.position.set(0, 50, -700)
    
    // Dos de carte
    backCard = new THREE.Mesh(
        cardGeometry,
        new THREE.MeshBasicMaterial({map: backCardPNG, transparent: true})
    )
    backCard.position.set(0, 50, -1)
    backCard.rotation.y = -3

    render();
})();

let currentIntersect = null
let currentArtist = null

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

var intersects
var artistesClicked = false;
var currentArtistsClicked = [];
var retour = false;
var speedAnim = 0.5 ;
var ecartArtist = 20;

window.addEventListener('click', () => {
    document.getElementById("hub_arrow").onclick = function(){
        // window.location.pathname = "./immersions/index.html";
        window.location.pathname = "./index.html";
    }
    if(document.getElementById("cursor").classList.contains('cross')){
        document.getElementById("cursor").classList.remove("cross")
    }else
    if(currentIntersect){
        document.getElementById("arrow").onclick = function(){
            retour = true;
            for(var card in currentArtistsClicked){
                console.log("here")
                gsap.to(currentArtistsClicked[card].position, {duration: speedAnim, x:0, y:heightArtist, z: 0})
                gsap.to(currentArtistsClicked[card].rotation, {duration: speedAnim, z:0})
            }
            document.getElementById("arrow").classList.add("hidden")

            setTimeout(function(){
                gScene.add(backCard);
                gsap.to(backCard.rotation, {duration: speedAnim, y: 0})
                gsap.to(backCard.position, {duration: speedAnim, z: 1})
                for(var card in currentArtistsClicked){
                    gsap.to(currentArtistsClicked[card].rotation, {duration: speedAnim, y: -3})
                }
                document.getElementById("hub_arrow").classList.remove("hidden")
            }, speedAnim * 1000)

            setTimeout(function(){
                for(var card in currentArtistsClicked){
                    gScene.remove(currentArtistsClicked[card])
                }
                gScene.remove(planeFond)
                gsap.to(backCard.position, {duration: speedAnim, y:heightCard})
            }, speedAnim * 1000 *2)
            setTimeout(function(){
                currentArtistsClicked = []
                cardCategories.forEach(category =>{
                    gScene.add(category)
                    gsap.to(category.rotation, {duration: speedAnim, y:0, z:0})
                })
                gsap.to(backCard.rotation, {duration: speedAnim, y:-3})
                gsap.to(backCard.position, {duration: speedAnim, z: -1})
            }, speedAnim * 1000 * 3)

            setTimeout(function(){
                gScene.remove(backCard)
                // if(cardCategories[i-1]){
                    for(var op = 0; op<cardCategories.length; op++){
                        if(cardCategories[0] && cardCategories[op] != cardCategories[0]){
                    //Placement en fonction de celle de gauche
                            gsap.to(cardCategories[op].position, {duration: speedAnim, x : cardCategories[0].position.x + ecartCard*(op+0.5-cardCategories.length/2), y: heightCard, z: 0})
                        } else {
                            gsap.to(cardCategories[op].position, {duration: speedAnim, x: -((cardCategories.length/2)*ecartCard)+15, y: heightCard,z: 0})
                        }
                    }
                artistesClicked = false
                
            }, speedAnim * 1000 * 4)
            
            setTimeout(function(){
                cardCategories.forEach(category =>{
                gsap.to(category.position, {duration: speedAnim, z:0})
            })
                artistesClicked = false
                retour = false
            }, speedAnim * 1000 * 5)
            
        }

        /**
         * Logique d'animation des cartes
         */
        for(var variable in objetJSON.categories){
            var path = currentIntersect.object.material.map.image.src;
            var page = path.split("artists/").pop().split("/card")[0];
            var backgroundCompared = backgroundTextures[variable][0]
            var compare = backgroundCompared.image.currentSrc.split("artists/").pop().split("/fond")[0];
            if(page == compare){
                planeFond.material.map = backgroundCompared
            }

            var localIntersect = currentIntersect.object.name

            if(currentIntersect.object.name == objetJSON.categories[variable].name_cat){
                document.getElementById("hub_arrow").classList.add("hidden")
                document.getElementById("arrow").classList.remove("hidden")
                gScene.add(backCard);

                cardCategories.forEach(category =>{
                    gsap.to(category.position, {duration: speedAnim, x: 0, y:50})
                })
                gsap.to(currentIntersect.object.position, {duration: speedAnim, x: 0, y:50, z:0.1})

                setTimeout(function(){
                    gsap.to(backCard.rotation, {duration: speedAnim, y: 0})
                    gsap.to(backCard.position, {duration: speedAnim, z: 1})
                    cardCategories.forEach(category =>{
                        gsap.to(category.rotation, {duration: speedAnim, y:3})
                    })
                }, speedAnim * 1000)

                setTimeout(function(){
                    cardCategories.forEach(category =>{
                        gScene.remove(category)
                    })
                    gsap.to(backCard.position, {duration: speedAnim, y: heightArtist})
                    gScene.add(planeFond)
                }, speedAnim * 1000 * 2)

                setTimeout(function(){
                    cardArtists.forEach(card => {
                        var lien = card.material.map.image.currentSrc.split("artists/").pop().split("/nomine")[0];
                        if(lien == localIntersect){
                            card.position.y = heightArtist
                            card.rotation.y = -3
                            currentArtistsClicked.push(card)
                        }
                    })
                    currentArtistsClicked.forEach(add => {
                        gScene.add(add)
                        gsap.to(add.rotation, {duration: speedAnim, y:0})
                    })                    
                    gsap.to(backCard.rotation, {duration:speedAnim, y:3})
                }, speedAnim * 1000 * 3)

                setTimeout(function(){
                    gScene.remove(backCard)
                    if(currentArtistsClicked.length%2 == 1){
                            for(var card in currentArtistsClicked){
                                if(currentArtistsClicked[card-1]){
                                    gsap.to(currentArtistsClicked[card].rotation, {duration: speedAnim, z : currentArtistsClicked[card].rotation.z - 0.01*Math.PI})   
                                } else {
                                    gsap.to(currentArtistsClicked[card].position, {duration: speedAnim, x: -((currentArtistsClicked.length/2)*ecartArtist)+15, y: heightArtist, z: 0})
                                    gsap.to(currentArtistsClicked[card].rotation, {duration: speedAnim, z : (currentArtistsClicked.length/2)*0.02*Math.PI})
                                }
                                if(currentArtistsClicked[card-1] && currentArtistsClicked[card].position.x == currentArtistsClicked[card-1].position.x){
                                    setTimeout(function(){
                                        currentArtistsClicked[card-1].position.x += 10
                                    }, speedAnim * 200)
                                    
                                }
                            }
                    } else {
                        for(var op = 0; op<currentArtistsClicked.length; op++){
                            if(currentArtistsClicked[0] && currentArtistsClicked[op] != currentArtistsClicked[0]){
                                gsap.to(currentArtistsClicked[op].rotation, {duration: speedAnim, z: currentArtistsClicked[0].rotation.z - op*0.01*Math.PI})
                                gsap.to(currentArtistsClicked[op].position, {duration:speedAnim, x: currentArtistsClicked[0].position.x+ecartArtist*(op-1)})
                            } else {
                                gsap.to(currentArtistsClicked[op].rotation, {duration: speedAnim, z : (currentArtistsClicked.length/2)*0.02*Math.PI})
                                gsap.to(currentArtistsClicked[op].position, {duration: speedAnim, x: -((currentArtistsClicked.length/2)*ecartArtist)+(currentArtistsClicked.length*5), y: heightArtist, z: 0})
                            }
                        }
                    }
                }, speedAnim * 1000 * 4)

            }
            else if(retour == false){
                for(var artist in currentArtistsClicked){
                    if(currentIntersect.object == currentArtistsClicked[artist]){
                        gsap.to(currentIntersect.object.position, {duration: 1, x: 0, y: 45, z:50})
                        gsap.to(currentIntersect.object.rotation, {duration: 1, z: 0})
                    }
                }
                artistesClicked = true
                if(currentArtist && currentArtist != currentIntersect){
                    for(var op = 0; op<currentArtistsClicked.length; op++){
                        if(currentArtistsClicked[0] && currentArtistsClicked[op] != currentArtistsClicked[0]){
                            gsap.to(currentArtistsClicked[op].rotation, {duration: speedAnim, z: currentArtistsClicked[0].rotation.z - op*0.01*Math.PI})
                            gsap.to(currentArtistsClicked[op].position, {duration:speedAnim, x: currentArtistsClicked[0].position.x+ecartArtist*(op-1), y: heightArtist, z: 0})
                        } else {
                            gsap.to(currentArtistsClicked[op].rotation, {duration: speedAnim, z : (currentArtistsClicked.length/2)*0.02*Math.PI})
                            gsap.to(currentArtistsClicked[op].position, {duration: speedAnim, x: -((currentArtistsClicked.length/2)*ecartArtist)+(currentArtistsClicked.length*5), y: heightArtist, z: 0})
                        }
                    }
                }
            }
            currentArtist = currentIntersect
        }
    }
})



function render() {
    if(document.getElementById("load").classList.contains("hidden")){

    const elapsedTime = clock.getElapsedTime()

    // Opacité du fond
    if(retour == true && planeFond.material.opacity>0){
        planeFond.material.opacity -=0.02
    } else if(gScene.getObjectByName("ecran") && planeFond.material.opacity<1){
        planeFond.material.opacity += 0.02
    }

    gsap.to(fond.rotation, {repeat: -1, y: elapsedTime})

    /**
     * Raycast
     */
    raycaster.setFromCamera(mouse, camera)

    if(currentArtistsClicked.length != 0){
        intersects = raycaster.intersectObjects(currentArtistsClicked)
    }else {
        intersects = raycaster.intersectObjects(categoriesToTest);
    }

    if(intersects.length){

        if(!currentIntersect && !artistesClicked){
            intersects[0].object.translateZ(5)
        }

        if(currentIntersect && currentIntersect.object.name !== intersects[0].object.name && !artistesClicked){
            intersects[0].object.translateZ(5)
            currentIntersect.object.translateZ(-5)
        }
        
        currentIntersect = intersects[0]
    } else {
        if(currentIntersect && !artistesClicked){

            currentIntersect.object.translateZ(-5)
        }
        
        currentIntersect = null
    }   
}
    cameraHelper.update();
    gRenderer.render(gScene, camera);

    requestAnimationFrame(render);
}