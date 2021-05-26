import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const cameraHelper = {
    init: initCameraHelper,
    switch: (oeuvre, chassis) => {},
    update: () => {},
};

function initCameraHelper(camera, target, controllerScope, cameraId) {
    //const cameraController = new OrbitControls(camera, controllerScope);

    // let cameraId = 0;

    cameraHelper.switch = (oeuvre, chassis) => {
        switch (cameraId++) {
            case 0:
                console.info('Chase camera');
                
                target.remove(camera);
                camera.fov = 70;
                cameraHelper.update = initChaseCamera(camera, target);
                break;
            case 1:
                console.info('Static camera');
                camera.position.set(0, 150, -20);
                cameraHelper.update = () => {camera.lookAt(target.position)};
                break;
            case 2:
                console.info('Hood camera');
    
                target.add(camera);
                camera.position.set(0, 4.5, -15);
                camera.rotation.set(0, 3.1, 0);
                camera.fov = 50;
                cameraHelper.update = () => {};
                break;
            case 3:
                target.remove(camera);
                camera.fov = 70;
                
                console.log(camera.position)
                cameraHelper.update = initMyCamera(camera, target, oeuvre);
                break;
            case 4:
                console.log('Camera Mentions Légales')

                target.add(camera);
                camera.position.set(-30, 6.5, 15);
                camera.rotation.set(0, 4.65, 0);
                camera.fov = 90;
                cameraHelper.update = () => {};
                break;
            case 5:
                console.log('Camera Hub')

                // target.add(camera)
                camera.position.set(-50, 16.5, 15);
                // camera.rotation.set(1, 4.65, 1);
                camera.fov = 90;
                cameraHelper.update = () => 
                {
                    camera.lookAt(target.position)
                    camera.position.set(target.position.x - 60, target.position.y + 25, target.position.z)
                    // camera.rotation.set(1, 4.65, 1)
                };
                break;
            default:
                cameraId = 0;
                cameraHelper.switch();
        }
    }

    cameraHelper.switch();
}

function initChaseCamera(camera, target) {
    const cameraMovementSpeed = 0.05; 
    const cameraLookPositionHeightOffset = 5;
    const cameraMountPosition = new THREE.Vector3();
    const cameraLookPosition = new THREE.Vector3();
    const chaseCameraMountPositionHelper = new THREE.Object3D();
    chaseCameraMountPositionHelper.position.set(-30, 25, -5);
    target.add(chaseCameraMountPositionHelper);

    return () => {
        chaseCameraMountPositionHelper.getWorldPosition(cameraMountPosition);

        if (cameraMountPosition.y < target.position.y) {
            cameraMountPosition.setY(target.position.y);
        }

        camera.position.lerp(cameraMountPosition, cameraMovementSpeed);
        cameraLookPosition.copy(target.position).y += cameraLookPositionHeightOffset;

        camera.lookAt(cameraLookPosition);
    };
}

function initMyCamera(camera, target, oeuvre, chassis) {
    const cameraMovementSpeed = 0.05; 
    const cameraLookPositionHeightOffset = 5;
    const cameraMountPosition = new THREE.Vector3();
    const cameraLookPosition = new THREE.Vector3();
    const chaseCameraMountPositionHelper = new THREE.Object3D();
    chaseCameraMountPositionHelper.position.set(1000, 25, 15);
    target.add(chaseCameraMountPositionHelper);

    // if(chassis != undefined){
    //     console.log("manjé")
    // camera.position.copy(chassis.position)
    // }

    return () => {
        chaseCameraMountPositionHelper.getWorldPosition(cameraMountPosition);

        // if (cameraMountPosition.y < target.position.y) {
            // cameraMountPosition.setY(target.position.y/2);
            // camera.position.copy(target.position)
            if (oeuvre){
                cameraMountPosition.setY(oeuvre.object.position.y)
                cameraMountPosition.setX(oeuvre.object.position.x + 150)
                cameraMountPosition.setZ(oeuvre.object.position.z - 10)
            }
            // cameraMountPosition.setZ(target.position.z + 10)
        // }

        camera.position.lerp(cameraMountPosition, cameraMovementSpeed);
        cameraLookPosition.copy(oeuvre.object.position).y += cameraLookPositionHeightOffset;

        camera.lookAt(cameraLookPosition);
    };
}
