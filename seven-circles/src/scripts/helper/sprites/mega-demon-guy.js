import IKSprite from "../inverse-kinematics/ik-sprite.js";
import GetSheetRenderer from "../inverse-kinematics/sheet-renderer.js";
import IKAnimator from "../inverse-kinematics/animator.js";
import TwoBoneResolver from "../inverse-kinematics/two-bone-resolver.js";

function GetLimb(anchor,left,withHand) {
    const sheetX = left ? 0 : 1;

    const upperArm = this.getBone(
        anchor,2,this.getSprite(sheetX,0,1,2,-0.5),1,0.9
    );
    const forearm = upperArm.addBone(
        2,this.getSprite(sheetX,2,1,2,-0.5),1,0.9
    );

    const bones = [upperArm,forearm];
    if(withHand) {
        const hand = forearm.addBone(
            1,this.getSprite(sheetX,4,1,1,-0.5),1
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

    IKSprite.call(this,image,baseSize,2,0,3,5,[
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
        data.x -= hand.width / 2, data.y -= hand.height / 2;
        return IKAnimator(data);
    };
    this.animateHandAsync = data => {
        return new Promise(resolve => {
            data.callback = resolve;
            this.animateHand(data);
        });
    };

    this.setHand = (left,x,y) => {
        const [boneA,boneB] = getArmBones(left);
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

    megaDemonGuy.leftLeg[0].zIndex -= 1, megaDemonGuy.rightLeg[0].zIndex -= 1;
    megaDemonGuy.leftLeg[1].zIndex -= 1, megaDemonGuy.rightLeg[1].zIndex -= 1;

    return megaDemonGuy;
}
export default AddMegaDemonGuy;
