const lerp = (v0,v1,t) => (1 - t) * v0 + t * v1;
const cosAngle = (a,b,c,d) => (a + b - c) / (2 * d);

/* Adapted and reworked from https://www.alanzucconi.com/2018/05/02/ik-2d-2/#id2018013660 */

function TwoBoneResolver(boneA,boneB,targetX,targetY,aStart,bStart,t) {
    if(isNaN(t)) t = 1;
    
    if(isNaN(aStart)) aStart = boneA.angle; if(isNaN(bStart)) bStart = boneB.angle;

    const targetDistance = Math.hypot(boneA.x - targetX,boneA.y - targetY);

    const targetDistance_2 = Math.pow(targetDistance,2);
    const boneALength_2 = Math.pow(boneA.length,2), boneBLength_2 = Math.pow(boneB.length,2);

    const boneAAngleCos = cosAngle(
        targetDistance_2,boneALength_2,boneBLength_2,targetDistance * boneA.length
    );
    const boneBAngleCos = cosAngle(
        boneBLength_2,boneALength_2,targetDistance_2,boneB.length * boneA.length
    );

    const boneAAngle = Math.acos(boneAAngleCos), boneBAngle = Math.acos(boneBAngleCos);

    const angle = Math.atan2(targetY - boneA.y,targetX - boneA.x);

    //Config...
    boneA.angle = lerp(aStart,angle - boneAAngle,t);
    boneB.angle = lerp(bStart,Math.PI - boneBAngle,t);
}
export default TwoBoneResolver;
