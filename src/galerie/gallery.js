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

// // Floor phys
// const floorShape = new CANNON.Box(new CANNON.Vec3(3200, 1, 100))
// const floorBody = new CANNON.Body({
//     mass: 0,
//     shape: floorShape,
//     position: new CANNON.Vec3(-2700, 0, 2)
// })
// gWorld.addBody(floorBody)

gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);
gWorld.gravity.set(0, -10, 0);
gWorld.defaultContactMaterial.friction = 1;

gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);

const vehicleInitialPosition = new THREE.Vector3(180, 25, 2.5);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI *0.50);
let resetVehicle = () => {};
let newVehicle = () => {};
var vehicleNewPosition;

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2();

var vehicle, chassis

const hauteurOeuvre = 70;
const ecartOeuvre = 225;
var pontTron;
var horizonGalerie;
var positionHorizon;
var fontUsed;

var objJSON;
var i = -1;
var j = -1;
var textures = [];
var textesGeometry = [];
var textes = [];
var firstCategoryPosition = [10, 80, 0];
var planeOeuvre = [];
var objectsToTest = [];

(async function init() {

    const [wheelGLTF, chassisGLTF, hansonJSON, pontTronGLTF, horizonGLTF, recognizerGLTF,
        testJSON] = await Promise.all([
        utils.loadResource('model/roue.gltf'),
        utils.loadResource('model/van.gltf'),
        utils.loadResource('fonts/Hanson_Bold.json'),
        utils.loadResource('model/Pont.gltf'),
        utils.loadResource('model/horizon_optimized.gltf'),
        utils.loadResource('model/recognizer_optimized.gltf'),
        utils.loadResource('infos/gallery.txt')
    ]);

    objJSON = JSON.parse(testJSON)

    fontUsed = hansonJSON

    // Sol
    
    // const floor = new THREE.Mesh(
    //     new THREE.PlaneGeometry(6000, 600),
    //     floorMaterial
    // )
    // floor.rotation.x = - Math.PI * 0.5
    // floor.position.set(-2700, 0, 2)
    
    // const floorSecond = new THREE.Mesh(
    //     new THREE.PlaneGeometry(6000, 600),
    //     floorMaterial
    // )
    // floorSecond.rotation.x = - Math.PI * 0.5
    // floorSecond.position.set(-8900, 0, 2)

    // const mur = new THREE.Mesh(
    //     new THREE.PlaneGeometry(6000, 600),
    //     new THREE.MeshStandardMaterial({color: '#000000'})
    // )
    // mur.rotation.y = Math.PI * 0.5
    // mur.position.set(-6000, -301, 2)
    
    // gScene.add(/*floor,*/ floorSecond, mur)

    horizonGalerie = horizonGLTF.scene
    horizonGalerie.scale.set(15, 15, 15)
    horizonGalerie.rotation.set(0, Math.PI*0.5, 0)
    gScene.add(horizonGalerie)

    // Recognizers
    const recognizer = recognizerGLTF.scene
    recognizer.scale.set(10, 10, 10)
    recognizer.rotation.y = -Math.PI*0.5
    var panneaux = []
    

    // // Pont retour vers Hub
    // pontTron = pontTronGLTF.scene
    // pontTron.scale.set(3.3, 3.3, 3.3)
    // pontTron.rotation.set(0, -Math.PI*0.5, 0)
    // pontTron.position.set(-5800,1,0)
    // gScene.add(pontTron)

    // Collider vers hub
    const collideShape = new CANNON.Box(new CANNON.Vec3(10, 10, 20))
    // const collideHub = new CANNON.Body({
    //     mass:0,
    //     shape: collideShape,
    //     position: new CANNON.Vec3(-5600, 0,0),
    // })
    // collideHub.collisionResponse = 0
    const collideBehind = new CANNON.Body({
        mass:1000,
        shape: collideShape,
        position: new CANNON.Vec3(250, 15,0),
        // quaternion: new CANNON.Quaternion(0, -0.47, 0)
    })
    // gWorld.addBody(collideHub)
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
        'des nommés',
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

    for(var cat in objJSON.categories){
        j += 1

        // Textes des catégories
        textesGeometry[j] = new THREE.TextGeometry(
            objJSON.categories[cat].name_cat,
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

        textes[j] = new THREE.Mesh(textesGeometry[j], textGalleryMaterial)
        textesGeometry[j].center()
        textes[j].rotateY(Math.PI/2)
        textes[j].rotateX(Math.PI*0.1)

        // Placement des textes + recognizers
        if(textes[j-1]){
            panneaux[j] = recognizer.clone()
            textes[j].position.set(textes[j-1].position.x - ((objJSON.categories[cat-1].oeuvres.length+1)*ecartOeuvre), firstCategoryPosition[1], firstCategoryPosition[2])
            panneaux[j].position.set(textes[j].position.x-10, 0, 0)
        } else {
            panneaux[j] = recognizer
            textes[j].position.set(firstCategoryPosition[0], firstCategoryPosition[1], firstCategoryPosition[2])
        }
        gScene.add(textes[j])
        gScene.add(panneaux[j])

        const oeuvreGeometry = new THREE.PlaneGeometry(152, 88)
        for(var oeuvre in objJSON.categories[cat].oeuvres){
            i = i+1
            // j +=1
            textures[i] = await Promise.all([
                utils.loadResource(objJSON.categories[cat].oeuvres[oeuvre].texture)
            ]);
            planeOeuvre[i] = new THREE.Mesh(
                oeuvreGeometry,
                new THREE.MeshStandardMaterial({map: textures[i][0]})
            )
            planeOeuvre[i].rotation.y = Math.PI * 0.5
            if(planeOeuvre[i-1]){
                planeOeuvre[i].position.set(planeOeuvre[i-1].position.x-ecartOeuvre, hauteurOeuvre, 0)
                if(planeOeuvre[i].position.x == panneaux[j].position.x){
                    planeOeuvre[i].position.x = planeOeuvre[i].position.x-ecartOeuvre
                }
            } else {
                planeOeuvre[i].position.set(panneaux[j].position.x-ecartOeuvre*(i+1), hauteurOeuvre, 0) 
            }
        
            objectsToTest[i] = planeOeuvre[i]
            gScene.add(planeOeuvre[i])
        }
    }

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(335*i, 600),
        floorMaterial
    )
    floor.rotation.x = - Math.PI * 0.5
    floor.position.set(-(((335*i)/2)-300), 0, 2)
    gScene.add(floor)

    // const floorSecond = new THREE.Mesh(
    //     new THREE.PlaneGeometry(335*i, 600),
    //     floorMaterial
    // )
    // floorSecond.rotation.x = - Math.PI * 0.5
    // floorSecond.position.set(-((335*i)+(335*(i-2))), 0, 2)

    const mur = new THREE.Mesh(
        new THREE.PlaneGeometry(6000, 600),
        new THREE.MeshStandardMaterial({color: '#000000'})
    )
    mur.rotation.y = Math.PI * 0.5
    mur.position.set(-(335*i), -301, 2)
    
    gScene.add(mur)

    // Pont retour vers Hub
    pontTron = pontTronGLTF.scene
    pontTron.scale.set(3.3, 3.3, 3.3)
    pontTron.rotation.set(0, -Math.PI*0.5, 0)
    pontTron.position.set(-(335*i)+200,1,0)
    gScene.add(pontTron)

    const collideHub = new CANNON.Body({
        mass:0,
        shape: collideShape,
        position: new CANNON.Vec3(-(335*i)+400, 0,0),
    })
    collideHub.collisionResponse = 0
    gWorld.addBody(collideHub)

    positionHorizon = -(335*i)-500

    // Floor phys
    const floorShape = new CANNON.Box(new CANNON.Vec3(-(((335*i)/2)+100), 1, 100))
    const floorBody = new CANNON.Body({
        mass: 0,
        shape: floorShape,
        position: new CANNON.Vec3(-(((335*i)/2)-300), 0, 2)
    })
    gWorld.addBody(floorBody)

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
        document.getElementById("cursor").classList.add('cursor')
        newVehicle = () => {
            vehicle.chassisBody.position.copy(vehicleNewPosition);
            vehicle.chassisBody.quaternion.copy(vehicleInitialRotation);
            vehicle.chassisBody.velocity.set(0, 0, 0);
            vehicle.chassisBody.angularVelocity.set(0, 0, 0);
        };
        newVehicle();
        cameraHelper.init(camera, chassis, gRenderer.domElement, 2);
        gScene.remove(nameCurrent, iutCurrent, avertCurrent)
        displayed = false
    } else
    if(currentIntersect){
        displayed = true;
        vehicleNewPosition = new THREE.Vector3(currentIntersect.object.position.x+90, 15, 2.5);
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
        
        gScene.add(nameCurrent, iutCurrent, avertCurrent)
        document.getElementById('canvas').style.cursor = "none"
        document.getElementById("cursor").classList.add("look")
        if(chassis != undefined){
            console.log("oskur")
            cameraHelper.switch(currentIntersect)
        }
    }
    
})

function render() {
    if(document.getElementById("load").classList.contains("hidden")){

        const elapsedTime = clock.getElapsedTime()

        // effectComposer.render()

        // if(chassis.position.x >= web[0]){
        if(chassis.position.x >= (textes[textes.length-2].position.x)){
            horizonGalerie.position.set(chassis.position.x - 3000, 1, -180)
        } else {
            horizonGalerie.position.set(positionHorizon, 1, -180)
        }

        directionLight.position.copy(chassis.position)
        directionLight.target.position.set(chassis.position.x-150, 50, 0)


        horizonLight.position.set(horizonGalerie.position.x+ 250, 700 , 150)

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(objectsToTest);

    if(intersects.length){
        if(!currentIntersect){
            // document.getElementById("canvas").style.cursor = "none"
            document.getElementById("cursor").classList.remove('cursor')
            document.getElementById("cursor").classList.add("look")
            if(displayed == true){
            document.getElementById("cursor").classList.add("look")
            document.getElementById("cursor").classList.remove("cross")
            }
            // console.log('mouse enter')
            // console.log(intersects[0])
        }
        
        currentIntersect = intersects[0]
    } else {
        if(currentIntersect){
            if(displayed == true){
                document.getElementById("cursor").classList.remove('cursor')
            document.getElementById("cursor").classList.remove("look")
            // document.getElementById("canvas").style.cursor = "none"
            document.getElementById("cursor").classList.add("cross")
            }else{
            document.getElementById("cursor").classList.add('cursor')
            }
            document.getElementById('cursor').classList.remove('look')
        }
        currentIntersect = null
    }

    if(chassis != undefined){
        pointLight.position.x = chassis.position.x
    }
    
    updatePhysics();
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

window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'V':
            resetVehicle();
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