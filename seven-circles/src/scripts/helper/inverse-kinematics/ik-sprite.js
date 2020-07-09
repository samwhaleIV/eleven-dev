import Joints from "./ik-joints.js";

function IKSprite(image,sheetX,sheetY,width,height,baseSize,joints) {
    this.x = 0, this.y = 0;
    this.collides = false;

    this.angle = 0;
    this.width = width; this.height = height;
    sheetX *= baseSize, sheetY *= baseSize;

    const frameWidth = width * baseSize;
    const frameHeight = height * baseSize;

    this.render = (context,x,y,width,height) => {
        let [centerX,centerY] = this.getCenter();
        
        const tileSize = width / this.width;
        centerX *= tileSize, centerY *= tileSize;
        centerX += x, centerY += y;

        const transform = context.getTransform();
        context.translate(centerX,centerY);
        context.rotate(this.angle);
        context.translate(-centerX,-centerY);
        context.drawImage(image,sheetX,sheetY,frameWidth,frameHeight,x,y,width,height);
        context.setTransform(transform);
    };

    this.centerJoint = null, this.targetJoint = null;

    this.update = () => {
        if(!this.targetJoint) return;
        this.centerOn(this.targetJoint.getPosition());
    };

    Joints.call(this,joints,baseSize);
}
IKSprite.prototype.getCenter = function() {
    let centerX, centerY;

    if(this.centerJoint) {
        centerX = this.centerJoint.x, centerY = this.centerJoint.y;
    } else {
        centerX = this.width / 2, centerY = this.height / 2;
    }

    return [centerX,centerY];
}
IKSprite.prototype.centerOn = function([x,y]) {
    const [centerX,centerY] = this.getCenter();
    this.x = x - centerX, this.y = y - centerY;
};
IKSprite.prototype.bindTo = function({
    target,targetJoint,joint 
}) {
    if(joint) {
        this.centerJoint = this.getJoint(joint);
    }
    this.targetJoint = target.getJoint(targetJoint);
};

export default IKSprite;
