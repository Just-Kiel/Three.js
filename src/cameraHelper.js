import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const cameraHelper = {
    init: initCameraHelper,
    switch: (oeuvre) => {},
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
                console.log(oeuvre)
                target.remove(camera)
                oeuvre.object.add(camera)
                camera.position.set(-10, 15, 150);
                camera.rotation.set(0, 0, 0);
                camera.fov = 90;
                cameraHelper.update = () => 
                {
                };
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

                camera.position.set(-50, 16.5, 15);
                camera.fov = 90;
                cameraHelper.update = () => 
                {
                    camera.lookAt(target.position)
                    camera.position.set(target.position.x, target.position.y + 35, target.position.z + 60)
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
