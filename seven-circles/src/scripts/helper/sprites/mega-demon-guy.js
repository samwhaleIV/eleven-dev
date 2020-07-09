import IKSprite from "../inverse-kinematics/ik-sprite.js";
import GetSheetRenderer from "./sheet-renderer.js";

function GetLimb(anchor,left) {

    const sheetX = left ? 0 : 1;

    const upperArm = this.getBone(anchor,2,this.getSprite(sheetX,0,1,2,-0.5),1,0.9);
    const forearm = upperArm.addBone(2,this.getSprite(sheetX,2,1,2,-0.5),1,0.9);
    const hand = forearm.addBone(1,this.getSprite(sheetX,4,1,1,-0.5),1);

    return [upperArm,forearm,hand];
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
        ["ShoulderLeft",7,36.5],["ShoulderRight",41,36.5],
        ["HipLeft",18,75],["HipRight",30,75]
    ]);
    this.leftArm = GetLimb.call(this,"ShoulderLeft",true);
    this.rightArm = GetLimb.call(this,"ShoulderRight",false);
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

    return megaDemonGuy;
}
export default AddMegaDemonGuy;
