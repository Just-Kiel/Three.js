import * as THREE from 'three'
import * as CANNON from 'cannon-es'

var wheelRadius = 0.7,
wheelHeight = 0.9
var wheelSuspensionRestLength = 0.5,
        wheelSuspensionStiffness = 85,
        wheelMaxSuspensionTravel = 0.3,
        wheelMaxSuspensionForce = Number.MAX_VALUE,
        wheelDampingCompression = 4.5,
        wheelDampingRelaxation = 2.3,
        wheelFrictionSlip = 5,
        wheelForwardAcceleration = 50,
        wheelSidedAcceleration = 1,
        wheelRollInfluence = 0.01

const maxSteeringAngle = 0.7

const torqueSplitRatio = [50, 50]

const brakeLightBrightness = 0.3;

const translateAxis = new THREE.Vector3(0, 0, 1);

const frontRightWheelIndex = 0;
const frontLeftWheelIndex = 1;
const rearRightWheelIndex = 2;
const rearLeftWheelIndex = 3;
const rearWheelIndices = new Set([rearRightWheelIndex, rearLeftWheelIndex]);
const [torqueSplitFront, torqueSplitRear] = torqueSplitRatio;
const defaultTorqueDistribution = [
    torqueSplitFront / 2, torqueSplitFront / 2,
    torqueSplitRear / 2, torqueSplitRear / 2,
];
const torqueDistribution = [...defaultTorqueDistribution];

const stateValueLimits = {
    engineForceMin: -1500,
    engineForceMax: 1500,
    steeringAngleMin: -0.7,
    steeringAngleMax: 0.7,
};

const defaultState = {
    engineForce: 0,
    brakeForce: 0,
    steeringAngle: 0,
};

export default class Vehicle{

    constructor(chassisMesh, wheelMesh){
        const chassisShape =  new CANNON.Box(new CANNON.Vec3(1.6, 1.5, 3.5))

        this.chassisBody = new CANNON.Body({mass: 10})
        this.chassisBody.addShape(chassisShape)

        this.base = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            // indexForwardAxis: 2,
            // indexRightAxis: 0,
            // indexUpAxis: 1
        })

        const wheelConfig = {
            radius: wheelRadius,
            // height: wheelHeight,
            // suspensionRestLength: wheelSuspensionRestLength,
            // suspensionStiffness: wheelSuspensionStiffness,
            // maxSuspensionTravel: wheelMaxSuspensionTravel,
            // maxSuspensionForce: wheelMaxSuspensionForce,
            // dampingCompression: wheelDampingCompression,
            // dampingRelaxation: wheelDampingRelaxation,
            // frictionSlip: wheelFrictionSlip,
            // forwardAcceleration: wheelForwardAcceleration,
            // sideAcceleration: wheelSidedAcceleration,
            // rollInfluence: wheelRollInfluence,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            directionLocal: new CANNON.Vec3(0, -1, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(),
            // customSlidingRotationalSpeed: -30,
            // useCustomSlidingRotationalSpeed: true,
        };

        const height = 0.6;
        const halfTrackWidth = 1.2;
        this.trackWidth = halfTrackWidth * 2;
        this.wheelBase = 2.5 + 2.5;
        // front left
        wheelConfig.chassisConnectionPointLocal.set(halfTrackWidth, -height, 2.3);
        this.base.addWheel(wheelConfig);
        // front right
        wheelConfig.chassisConnectionPointLocal.set(-halfTrackWidth, -height, 2.3);
        this.base.addWheel(wheelConfig);
        // rear left
        wheelConfig.chassisConnectionPointLocal.set(halfTrackWidth, -height, -2.3);
        this.base.addWheel(wheelConfig);
        // rear right
        wheelConfig.chassisConnectionPointLocal.set(-halfTrackWidth, -height, -2.3);
        this.base.addWheel(wheelConfig);

        //this.materials = setMaterials(wheelMesh, chassisMesh)

        const wheelMeshes = {
            rear_l: wheelMesh,
            rear_r: wheelMesh.clone(),
            front_l: wheelMesh.clone(),
            front_r: wheelMesh.clone()
        }

        const axes = ['x', 'y', 'z']
        Object.keys(wheelMeshes).forEach((wheelId) => 
        {
            if(wheelId.endsWith('_l')){
                axes.forEach((axis) =>
                {
                    wheelMeshes[wheelId].scale[axis] *= -1
                })
            }
        })

        this.wheelMeshes= [wheelMeshes.front_l, wheelMeshes.front_r, wheelMeshes.rear_l, wheelMeshes.rear_r]
        this.chassisMesh = chassisMesh

        this.state = this.initStateHandler(this)
    }


    valueBetween(value, min, max){
        return Math.max(min, Math.min(value, max));
    }

    initStateHandler(vehicle){
        
        return new Proxy(defaultState, {
            set(state, prop, value) {
                
                const currentValue = state[prop];
                //const nextValue = valueBetween(value, stateValueLimits[`${prop}Min`], stateValueLimits[`${prop}Max`]);
                const nextValue = Math.max(stateValueLimits[`${prop}Min`], Math.min(value, stateValueLimits[`${prop}Max`]));
    
                if (currentValue !== nextValue) {
                    state[prop] = nextValue;
                }
    
                return true;
            },
        });
    }

    

    addToWorld(world){
        this.base.addToWorld(world)

        console.log('my world')



        // world.addEventListener('postStep', this.update = () =>
        // {
        //     // this.steerWheels()
        //     // this.applyWheelSlipReduction()
        //     // this.setEngineForceDirection()

        // var tmp_transform

        // for(let i = 0; i<this.base.wheelInfos.length; i++){
        //     //console.log(this.state.engineForce)
        //     //console.log(torqueDistribution[i])

        //     //this.base.applyEngineForce(this.state.engineForce * torqueDistribution[i] * 1, i)
        //     this.base.updateWheelTransform(i)

        //     tmp_transform = this.base.wheelInfos[i].worldTransform
        //     this.wheelMeshes[i].position.copy(tmp_transform.position)
        //     this.wheelMeshes[i].quaternion.copy(tmp_transform.quaternion)
        // }
        // this.chassisMesh.position.copy(this.chassisBody.position)
        // //console.log(this.chassisMesh.position)
        // //console.log(this.chassisBody.position)
        // this.chassisMesh.quaternion.copy(this.chassisBody.quaternion)
        // this.chassisMesh.translateOnAxis(translateAxis, 0.6)
        // })

        return this
    }

    addToScene(scene){
        console.log('my scene')
        this.wheelMeshes.forEach((wheelMesh) =>
        {
            scene.add(wheelMesh)
        })
        scene.add(this.chassisMesh)
        return this
    }

    // update(){

    //     this.steerWheels()
    //     this.applyWheelSlipReduction()
    //     this.setEngineForceDirection()
    //     console.log('poupipou')

    //     var tmp_transform

    //     for(let i = 0; i<this.base.wheelInfos.length; i++){
    //         this.base.applyEngineForce(this.state.engineForce * torqueDistribution[i] * 0.01, i)
    //         this.base.updateWheelTransform(i)

    //         tmp_transform = this.base.wheelInfos[i].worldTransform
    //         this.wheelMeshes[i].position.copy(tmp_transform.position)
    //         this.wheelMeshes[i].quaternion.copy(tmp_transform.quaternion)
    //     }
    //     this.chassisMesh.position.copy(this.chassisBody.position)
    //     this.chassisMesh.quaternion.copy(this.chassisBody.quaternion)
    //     this.chassisMesh.translateOnAxis(translateAxis, 0.6)
    // }

    setEngineForceDirection(engineForceDirection){
        if(engineForceDirection != undefined)
        {
        this.state.engineForce = 2000 * engineForceDirection
        //console.log(this.state.engineForce )
        }
        //console.log(this.state.engineForce)

        if(engineForceDirection === -1){
            //reverse
            this.state.engineForce *= 0.9
        }
    }

    applyWheelSlipReduction(){
        const frontLeftWheelHasGrip = this.wheelHasGrip(frontLeftWheelIndex);
        const frontRightWheelHasGrip = this.wheelHasGrip(frontRightWheelIndex);
        const rearLeftWheelHasGrip = this.wheelHasGrip(rearLeftWheelIndex);
        const rearRightWheelHasGrip = this.wheelHasGrip(rearRightWheelIndex);

        if (frontLeftWheelHasGrip && !rearLeftWheelHasGrip && torqueDistribution[rearLeftWheelIndex] > 1) {
            torqueDistribution[frontLeftWheelIndex] += 1;
            torqueDistribution[rearLeftWheelIndex] -= 1;
        } else if (!frontLeftWheelHasGrip && rearLeftWheelHasGrip && torqueDistribution[frontLeftWheelIndex] > 1) {
            torqueDistribution[frontLeftWheelIndex] -= 1;
            torqueDistribution[rearLeftWheelIndex] += 1;
        } else {
            const diffSign = Math.sign(
                torqueDistribution[frontLeftWheelIndex] - defaultTorqueDistribution[frontLeftWheelIndex],
            );
            if (diffSign) {
                torqueDistribution[frontLeftWheelIndex] -= diffSign * 1;
                torqueDistribution[rearLeftWheelIndex] += diffSign * 1;
            }
        }

        if (frontRightWheelHasGrip && !rearRightWheelHasGrip && torqueDistribution[rearRightWheelIndex] > 1) {
            torqueDistribution[frontRightWheelIndex] += 1;
            torqueDistribution[rearRightWheelIndex] -= 1;
        } else if (!frontRightWheelHasGrip && rearRightWheelHasGrip && torqueDistribution[frontRightWheelIndex] > 1) {
            torqueDistribution[frontRightWheelIndex] -= 1;
            torqueDistribution[rearRightWheelIndex] += 1;
        } else {
            const diffSign = Math.sign(
                torqueDistribution[frontRightWheelIndex] - defaultTorqueDistribution[frontRightWheelIndex],
            );
            if (diffSign) {
                torqueDistribution[frontRightWheelIndex] -= diffSign * 1;
                torqueDistribution[rearRightWheelIndex] += diffSign * 1;
            }
        }
    }


    setBrakeForce(brakeForceFactor) {
        this.state.brakeForce = maxBrakeForce * brakeForceFactor;
        rearWheelIndices.forEach(this.brakeWheel);
    }

    brakeWheel(wheelIndex){
        this.base.setBrake(this.state.brakeForce, wheelIndex);
    }

    setSteeringDirection(steeringDirection) {
        this.state.steeringAngle = maxSteeringAngle * steeringDirection;
    }

    steerWheels(){
        const { currentSteeringAngle } = this;
        const { steeringAngle: targetSteeringAngle } = this.state;
        let steeringAngle = 0;

        if (currentSteeringAngle < targetSteeringAngle) {
            // steer left
            steeringAngle = Math.min(targetSteeringAngle, currentSteeringAngle + steeringSpeed);
        } else if (currentSteeringAngle > targetSteeringAngle) {
            // steer right
            steeringAngle = Math.max(targetSteeringAngle, currentSteeringAngle - steeringSpeed);
        } else {
            return;
        }

        const { wheelBase, trackWidth } = this;
        const wheelBase_x2 = wheelBase * 2;
        const steeringAngle_sin = Math.sin(steeringAngle);
        const steeringAngle_cos = Math.cos(steeringAngle);

        const steeringAngleLeft = Math.atan(
            (wheelBase_x2 * steeringAngle_sin) / (wheelBase_x2 * steeringAngle_cos - trackWidth * steeringAngle_sin),
        );
        const steeringAngleRight = Math.atan(
            (wheelBase_x2 * steeringAngle_sin) / (wheelBase_x2 * steeringAngle_cos + trackWidth * steeringAngle_sin),
        );
        this.base.setSteeringValue(steeringAngleLeft, frontLeftWheelIndex);
        this.base.setSteeringValue(steeringAngleRight, frontRightWheelIndex);
        this.currentSteeringAngle = steeringAngle;
    }

    // resetPosition() {
    //     this.chassisBody.position.copy(this.initialPosition);
    //     this.chassisBody.quaternion.copy(this.initialRotation);
    //     this.chassisBody.velocity.setZero();
    //     this.chassisBody.angularVelocity.setZero();
    // }

    wheelHasGrip(wheelIndex){
        this.base.wheelInfos[wheelIndex].isInContact && !this.base.wheelInfos[wheelIndex].sliding
    }


    // setMaterials(wheel, chassis){
    //     //apparemment pas utile
    //     wheel.traverse((childMesh) =>
    //     {
    //         if(childMesh.)
    //     })
    // }
}