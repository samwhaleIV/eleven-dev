const lerp = (v0,v1,t) => (1 - t) * v0 + t * v1;
const cosAngle = (a,b,c,d) => (a + b - c) / (2 * d);

const getAngle = (x1,y1,x2,y2) => {
    /*
      Rewrote from https://stackoverflow.com/a/47653643
      God bless you.
    */
    const dx = x1 - x2, dy = y1 - y2;
    let angle = Math.atan2(-dy,-dx);
    if(angle < 0) angle += Math.PI * 2;
    return angle;
};
const acosLimit = cos => {
    let result = Math.acos(cos);
    if(isNaN(result)) result = 0;
    return result;
};
const getStartAngle = (start,bone) => {
    if(!isNaN(start)) return start;
    let {angle} = bone;
    if(isNaN(angle)) angle = 0;
    return angle;
};

function TwoBoneResolver(boneA,boneB,targetX,targetY,aStart,bStart,t) {
    /*
      Adapted from https://www.alanzucconi.com/2018/05/02/ik-2d-2/#id2018013660
    */

    if(isNaN(t)) t = 1;
    aStart = getStartAngle(aStart,boneA), bStart = getStartAngle(bStart,boneB);

    const targetDistance = Math.hypot(boneA.x - targetX,boneA.y - targetY);
    const angle = getAngle(boneA.x,boneA.y,targetX,targetY);

    if(targetDistance >= boneA.length + boneB.length) {
        boneA.angle = lerp(aStart,angle,t);
        boneB.angle = lerp(bStart,angle,t);
        return;
    }

    const targetDistance_2 = Math.pow(targetDistance,2);
    const boneALength_2 = Math.pow(boneA.length,2), boneBLength_2 = Math.pow(boneB.length,2);

    const boneAAngleCos = cosAngle(
        targetDistance_2,boneALength_2,boneBLength_2,targetDistance * boneA.length
    );
    const boneBAngleCos = cosAngle(
        boneBLength_2,boneALength_2,targetDistance_2,boneB.length * boneA.length
    );

    const boneAAngle = acosLimit(boneAAngleCos), boneBAngle = acosLimit(boneBAngleCos);

    boneA.angle = lerp(aStart,angle - boneAAngle,t);
    boneB.angle = lerp(bStart,boneA.angle + Math.PI - boneBAngle,t);
}
export default TwoBoneResolver;
