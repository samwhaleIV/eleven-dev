function Anchor(
    target,name,x,y
) {
    this.name = name;
    this.target = target;
    this.x = x, this.y = y;
    this.calculateAngle();
    Object.freeze(this);
}
Anchor.prototype.calculateAngle = function() {
    const [xCenter,yCenter] = this.getTargetCenter();

    const xOffset = this.x - xCenter;
    const yOffset = this.y - yCenter;

    this.distance = Math.hypot(xOffset,yOffset);
    this.angle = Math.atan2(xOffset,yOffset);
};
Anchor.prototype.getLocation = function() {
    const [xCenter,yCenter] = this.getTargetCenter();

    let {angle,distance} = this;
    angle -= this.target.angle;

    const x = Math.sin(angle) * distance;
    const y = Math.cos(angle) * distance;

    return [xCenter+x,yCenter+y];
};
Anchor.prototype.getTargetCenter = function() {
    const {target} = this;

    const xCenter = target.x + target.width / 2;
    const yCenter = target.y + target.height / 2;

    return [xCenter,yCenter];
}

function Anchors(joints,coordinateBase=1) {
    const jointContainer = new Object();

    for(const jointData of joints) {
        let [name,x,y] = jointData;
        x /= coordinateBase, y /= coordinateBase;

        const joint = new Anchor(this,name,x,y);
        jointContainer[name] = joint;
    }

    const getAnchor = name => {
        if(!(name in jointContainer)) return null;
        const joint = jointContainer[name];
        return joint;
    };

    this.getAnchor = getAnchor;
}
export default Anchors;
