function BoatController(world,boat) {

    const accelPerSecond = 0.5;
    const reverseAccel = -0.5;

    const deaccelPerSecond = 1;

    const maxVelocity = 1.5;
    const maxReverseVelocity = -0.75;

    const rotationAnimDecay = -0.25;
    const rotationAnimRate = 0.25;
    const rotationAnimMax = 0.5;
    const rotationVelocity = 1.5;

    let movingVelocity = 0, rotationAnimVelocity = 0;

    const PI2 = Math.PI * 2;

    let downKeys = {};
    const inputProxy = world.getInputProxy();
    const {codes,managedGamepad} = SVCC.Runtime.InputServer;

    const axiRotationLimit = 0.05;

    const clampAngle = angle => {
        angle = Math.abs(angle);
        angle = angle % PI2;
        return angle;
    };

    const rotateAngle = (angle,rotation) => {
        return clampAngle(angle + rotation);
    }

    const getBestRotationDelta = (a,b) => {
        if(a >= b - axiRotationLimit && a <= b + axiRotationLimit) {
            return 0;
        }
        if((a - b + PI2) % PI2 < Math.PI) {
            return 1;
        } else {
            return -1;
        }
    };

    const getRotationDelta = axis => {
        if(axis.active) {
            const angle = rotateAngle(Math.atan2(-axis.x,axis.y),PI2);
            const boatAngle = boat.angle;
            return getBestRotationDelta(angle,boatAngle);
        }
        let rotationDelta = 0;
        if(codes.Left in downKeys) {
            rotationDelta -= 1;
        }
        if(codes.Right in downKeys) {
            rotationDelta += 1;
        }
        return rotationDelta;
    };

    const getMovingDelta = axis => {
        if(axis.active) {
            const {angle} = boat;

            const x = Math.sin(angle), y = Math.cos(angle);
            const distance = Math.hypot(-axis.x - x,axis.y - y);

            return distance < 1 ? 1 : -1;
        }
        let movingDelta = 0;
        if(codes.Up in downKeys) {
            movingDelta += 1;
        }
        if(codes.Down in downKeys) {
            movingDelta -= 1;
        }
        return movingDelta;
    };

    const accelerateMovingVelocity = (movingDelta,deltaSecond) => {
        if(movingDelta < 0) {
            movingVelocity = Math.max(movingVelocity + reverseAccel * deltaSecond,maxReverseVelocity);
        } else {
            movingVelocity = Math.min(movingVelocity + accelPerSecond * deltaSecond,maxVelocity);
        }
    };

    const deaccelerateMovingVelocity = deltaSecond => {
        if(movingVelocity !== 0) {
            if(movingVelocity < 0) {
                movingVelocity = Math.min(movingVelocity + deaccelPerSecond * deltaSecond,0);
            } else if(movingVelocity > 0) {
                movingVelocity = Math.max(movingVelocity - deaccelPerSecond * deltaSecond,0);
            }
        }
    };

    const accelerateRotationAnim = (rotationDelta,deltaSecond) => {
        if(rotationDelta !== 0) {
            rotationAnimVelocity = Math.min(rotationAnimVelocity + rotationAnimRate * deltaSecond,rotationAnimMax);
        } else {
            rotationAnimVelocity = Math.max(rotationAnimVelocity + rotationAnimDecay * deltaSecond,0);
        }
    };

    const setBoatAngle = (rotationDelta,deltaSecond) => {
        boat.angle += rotationDelta * deltaSecond * rotationVelocity;
        if(boat.angle < 0) {
            boat.angle += PI2;
        } else if(boat.angle > PI2) {
            boat.angle -= PI2;
        }
    };

    const setAngularVelocity = () => {
        boat.xVelocity = -Math.sin(boat.angle);
        boat.yVelocity = Math.cos(boat.angle);

        boat.xVelocity *= movingVelocity;
        boat.yVelocity *= movingVelocity;
    };
    const clearAngularVelocity = () => {
        boat.xVelocity = 0, boat.yVelocity = 0;
    };

    const setPaddleIntensity = () => {
        boat.paddleIntensity = Math.max(Math.abs(movingVelocity),rotationAnimVelocity);
    };

    const boatUpdater = ({deltaSecond}) => {
        const leftAxis = managedGamepad.getLeftAxis();

        const rotationDelta = getRotationDelta(leftAxis);
        const movingDelta = getMovingDelta(leftAxis);
        const hasMovingDelta = movingDelta !== 0;

        if(hasMovingDelta) {
            accelerateMovingVelocity(movingDelta,deltaSecond);
        }
        if(!hasMovingDelta) {
            deaccelerateMovingVelocity(deltaSecond);
        }

        const isMoving = movingVelocity !== 0;
        if(!isMoving) clearAngularVelocity();

        accelerateRotationAnim(rotationDelta,deltaSecond);
        setBoatAngle(rotationDelta,deltaSecond);
        setPaddleIntensity();

        if(isMoving) setAngularVelocity();
    };

    world.dispatchRenderer.addUpdate((context,size,time)=>{
        boatUpdater(time); downKeys = {};
    },-1);

    const downKeyApplicator = keys => {
        downKeys = Object.assign(downKeys||{},keys);
    };

    const keyDown = ({impulse}) => {
        if(impulse === codes.Click) {

        }
    };

    inputProxy.set({
        sendToBase: true,
        boundKeyboard: true,
        mirroredGamepad: true,
        keyDown: keyDown,
        input: downKeyApplicator,
    });
}
export default BoatController;
