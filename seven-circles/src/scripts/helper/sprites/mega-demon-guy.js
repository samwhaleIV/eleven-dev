import IKSprite from "../inverse-kinematics/ik-sprite.js";
import GetSheetRenderer from "./sheet-renderer.js";

function GetLimb(anchor,left,withHand) {

    const sheetX = left ? 0 : 1;

    const upperArm = this.getBone(anchor,2,this.getSprite(sheetX,0,1,2,-0.5),1,0.9);
    const forearm = upperArm.addBone(2,this.getSprite(sheetX,2,1,2,-0.5),1,0.9);


    const bones = [upperArm,forearm];
    if(withHand) {
        const hand = forearm.addBone(1,this.getSprite(sheetX,4,1,1,-0.5),1);
        bones.push(hand);
    }

    return bones;
}

function MegaDemonGuy(image) {
    const baseSize = 16;
    
    this.getSprite = (x,y,width,height,xOffset,yOffset) => {
        return GetSheetRenderer(
            image,baseSize,x,y,width,height,xOffset,yOffset
        );
        return (context,x,y,width,height) => {
            context.fillStyle = "red";
            context.fillRect(x,y,width,height);
        };
    };

    IKSprite.call(this,image,baseSize,2,0,3,5,[
        ["ShoulderLeft",7.5,36],["ShoulderRight",40.5,36],
        ["HipLeft",14,73],["HipRight",34,73]
    ]);

    this.leftArm = GetLimb.call(this,"ShoulderLeft",true,true);
    this.rightArm = GetLimb.call(this,"ShoulderRight",false,true);

    this.leftLeg = GetLimb.call(this,"HipLeft",true,false);
    this.rightLeg = GetLimb.call(this,"HipRight",false,false);
}
MegaDemonGuy.prototype = IKSprite.prototype;

function AddMegaDemonGuy(world,x,y,centerX,centerY) {
    const image = Eleven.ResourceManager.getImage("mega-demon-guy");
    const megaDemonGuy = new MegaDemonGuy(image,2,0,3,5);

    megaDemonGuy.x = centerX ? x - megaDemonGuy.width / 2 : x;
    megaDemonGuy.y = centerY ? y - megaDemonGuy.height / 2 : y;

    world.spriteLayer.add(megaDemonGuy);

    for(const bone of megaDemonGuy.bones) {
        let nextBone = bone;
        while(nextBone) {
            world.spriteLayer.add(nextBone);
            nextBone = nextBone.child;
        }
    }

    megaDemonGuy.leftLeg[0].zIndex -= 1, megaDemonGuy.rightLeg[0].zIndex -= 1;
    megaDemonGuy.leftLeg[1].zIndex -= 1, megaDemonGuy.rightLeg[1].zIndex -= 1;

    return megaDemonGuy;
}
export default AddMegaDemonGuy;
