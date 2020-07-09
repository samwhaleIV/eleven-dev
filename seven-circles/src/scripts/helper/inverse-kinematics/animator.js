import TwoBoneResolver from "./two-bone-resolver.js";

const DEFAULT_DURATION = 1000;

function IKAnimator({
    world,x,y,duration,boneA,boneB,callback
}) {
    if(isNaN(duration)) duration = DEFAULT_DURATION;

    const boneAStart = boneA.angle, boneBStart = boneB.angle;

    const {dispatchRenderer} = world;
    let animationID = null;

    let resolved = false;
    const resolveAnimation = () => {
        if(resolved) return false; resolved = true;
        dispatchRenderer.removeUpdate(animationID);
        if(callback) callback();
        return true;
    };

    let startTime = null;
    animationID = dispatchRenderer.addUpdate((context,size,{now})=>{
        if(!startTime) startTime = now;

        let t = (now - startTime) / duration;
        if(t < 0) t = 0; else if(t >= 1) t = 1;

        if(t === 1) resolveAnimation();
    
        TwoBoneResolver(boneA,boneB,x,y,boneAStart,boneBStart,t);
    });
    return resolveAnimation;
}

export default IKAnimator;
