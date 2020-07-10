import IKSprite from "../inverse-kinematics/ik-sprite.js";
import GetSheetRenderer from "../inverse-kinematics/sheet-renderer.js";
import IKAnimator from "../inverse-kinematics/animator.js";
import TwoBoneResolver from "../inverse-kinematics/two-bone-resolver.js";

function GetLimb(anchor,left,withHand) {
    const sheetY = left ? 1 : 0;

    const upperArm = this.getBone(
        anchor,2,this.getSprite(3,sheetY,2,1,0,-0.5),1,0.9
    );
    const forearm = upperArm.addBone(
        2,this.getSprite(5,sheetY,2,1,0,-0.5),1,0.9
    );

    const bones = [upperArm,forearm];
    if(withHand) {
        const hand = forearm.addBone(
            1,this.getSprite(7,sheetY,1,1,0,-0.5),1
        );
        bones.push(hand);
    }
    return bones;
}

function MegaDemonGuy(world,image) {
    const baseSize = 16;
    this.getSprite = (x,y,width,height,xOffset,yOffset) => GetSheetRenderer(
        image,baseSize,x,y,width,height,xOffset,yOffset
    );

    const limb = (name,left,withHand) => {
        name += left ? "Left" : "Right";
        return GetLimb.call(this,name,left,withHand);
    };
    const arm = (name,left) => limb(name,left,true);
    const leg = (name,left) => limb(name,left,false);

    IKSprite.call(this,image,baseSize,0,0,3,5,[
        ["ShoulderLeft",7.5,36],["ShoulderRight",40.5,36],
        ["HipLeft",14,73],["HipRight",34,73]
    ]);

    this.leftArm = arm("Shoulder",true), this.rightArm = arm("Shoulder",false);
    this.leftLeg = leg("Hip",true), this.rightLeg = leg("Hip",false);

    const getArmBones = left => {
        return left ? this.leftArm : this.rightArm;
    };

    this.animateHand = data => {
        const [boneA,boneB,hand] = getArmBones(data.left);
        Object.assign(data,{boneA,boneB,world});
        return IKAnimator(data);
    };
    this.animateHandAsync = data => {
        return new Promise(resolve => {
            data.callback = resolve;
            this.animateHand(data);
        });
    };

    this.setHand = (left,x,y) => {
        const [boneA,boneB,hand] = getArmBones(left);
        y -= hand.height / 2;
        TwoBoneResolver(boneA,boneB,x,y);
    };

    this.getBones = function*() {
        for(const bone of this.bones) {
            let nextBone = bone;
            while(nextBone) {
                yield nextBone;
                nextBone = nextBone.child;
            }
        }
    };

    this.leftHand = this.leftArm[2], this.rightHand = this.rightArm[2];
}
MegaDemonGuy.prototype = IKSprite.prototype;

function AddMegaDemonGuy(world,x,y,centerX,centerY) {
    const image = Eleven.ResourceManager.getImage("mega-demon-guy");
    const megaDemonGuy = new MegaDemonGuy(world,image,2,0,3,5);

    megaDemonGuy.x = centerX ? x - megaDemonGuy.width / 2 : x;
    megaDemonGuy.y = centerY ? y - megaDemonGuy.height / 2 : y;

    megaDemonGuy.update();
    world.spriteLayer.add(megaDemonGuy);

    for(const bone of megaDemonGuy.getBones()) {
        world.spriteLayer.add(bone);
        bone.update();
    }

    const demonGuyZIndex = 0;

    const shoulderZIndex = demonGuyZIndex + 2;
    const forearmZIndex = shoulderZIndex + 1;
    const handZIndex = forearmZIndex + 1;

    const thighZIndex = demonGuyZIndex - 1;
    const calfZIndex = thighZIndex - 1;

    const {rightArm,leftArm,rightLeg,leftLeg} = megaDemonGuy;
    megaDemonGuy.zIndex = demonGuyZIndex;

    rightArm[0].zIndex = shoulderZIndex, leftArm[0].zIndex = shoulderZIndex;
    rightArm[1].zIndex = forearmZIndex, leftArm[1].zIndex = forearmZIndex;
    rightArm[2].zIndex = handZIndex, leftArm[2].zIndex = handZIndex;
    
    leftLeg[0].zIndex = thighZIndex, rightLeg[0].zIndex = thighZIndex;
    leftLeg[1].zIndex = calfZIndex, rightLeg[1].zIndex = calfZIndex;

    return megaDemonGuy;
}
export default AddMegaDemonGuy;
