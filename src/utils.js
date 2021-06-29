import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'


export {
    loadResource,
};

//Loader
const loadingManager = new THREE.LoadingManager(
    () =>
    {
        document.getElementById("complete").addEventListener("animationend", function() {
            document.getElementById("load").style.cursor = "auto"
            document.getElementById("load").classList.remove("load-non")
            document.getElementById("load").classList.add("load-active")
        }, false);

        document.getElementById("load").addEventListener('animationend', function(){
            document.getElementById("load").classList.add("hidden")
        }, false);
    }
)

function loadResource(url) {
    const extension = url.split('.').pop();
    let loader;

    switch (extension) {
        case 'jpg':
        case 'png':
            loader = new THREE.TextureLoader(loadingManager);
            break;
        case 'glb':
        case 'gltf':
            loader = new GLTFLoader(loadingManager);
            break;
        case 'json':
            loader = new THREE.FontLoader(loadingManager)
            break;
        case 'txt':
            loader = new THREE.FileLoader(loadingManager)
            break;
        default:
            return Promise.reject(new Error(`unknown resource type [${extension}]`));
    }

    return new Promise((resolve, reject) => {
        const onLoad = (resource) => resolve(resource);
        const onProgress = () => {};
        const onError = (e) => {
            console.error('Failed to load resource: ' + e.target.src);
            reject(e);
        };

        loader.load(url, onLoad, onProgress, onError);
    });
}