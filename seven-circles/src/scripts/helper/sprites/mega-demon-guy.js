import IKSprite from "../inverse-kinematics/ik-sprite.js";

function MegaDemonGuy(image) {
    const baseSize = 16;
    IKSprite.call(this,image,2,0,3,5,baseSize,[
        ["ShoulderLeft",4,38],["ShoulderRight",44,38],
        ["HipLeft",18,75],["HipRight",30,75]
    ]);

    const handJoints = [["Wrist",8,3],["Palm",8,10]];

    this.leftUpperArm = new IKSprite(image,0,0,1,2,baseSize,[
        ["Shoulder",11,4],["Elbow",8,28]
    ]);

    this.rightUpperArm = new IKSprite(image,0,1,1,2,baseSize,[
        ["Shoulder",5,4],["Elbow",8,28]
    ]);

    const foreArmJoints = [["Elbow",8,4],["Wrist",8,29]];

    this.leftForearm = new IKSprite(image,0,2,1,2,baseSize,foreArmJoints);
    this.rightForearm = new IKSprite(image,1,2,1,2,baseSize,foreArmJoints);

    this.leftHand = new IKSprite(
        image,0,4,1,1,baseSize,handJoints
    );
    this.rightHand = new IKSprite(
        image,1,4,1,1,baseSize,handJoints
    );

    this.leftUpperArm.bindTo({
        target: this, targetJoint: "ShoulderLeft", joint: "Shoulder"
    });
    this.leftForearm.bindTo({
        target: this.leftUpperArm, targetJoint: "Elbow", joint: "Elbow"
    });
    this.leftHand.bindTo({
        target: this.leftForearm, targetJoint: "Wrist", joint: "Wrist"
    });

}
MegaDemonGuy.prototype = IKSprite.prototype;

function AddMegaDemonGuy(world,x,y,centerX,centerY) {
    const image = Eleven.ResourceManager.getImage("mega-demon-guy");
    const megaDemonGuy = new MegaDemonGuy(image,2,0,3,5);

    megaDemonGuy.x = centerX ? x - megaDemonGuy.width / 2 : x;
    megaDemonGuy.y = centerY ? y - megaDemonGuy.height / 2 : y;

    world.spriteLayer.add(megaDemonGuy);

    world.spriteLayer.add(megaDemonGuy.leftUpperArm);
    return megaDemonGuy;
    world.spriteLayer.add(megaDemonGuy.leftForearm);
    world.spriteLayer.add(megaDemonGuy.leftHand);

    /*
    world.spriteLayer.add(megaDemonGuy.rightUpperArm);
    world.spriteLayer.add(megaDemonGuy.rightForearm);
    world.spriteLayer.add(megaDemonGuy.rightHand);
    */

    return megaDemonGuy;
}
export default AddMegaDemonGuy;
