function Joint(target,name,x,y) {
    this.name = name;
    this.target = target;
    this.x = x, this.y = y;
    this.calculateAngle();
    Object.freeze(this);
}
Joint.prototype.calculateAngle = function() {
    const [xCenter,yCenter] = this.getTargetCenter();

    const xOffset = this.x - xCenter;
    const yOffset = this.y - yCenter;

    this.distance = Math.hypot(xOffset,yOffset);
    this.angle = Math.atan2(xOffset,yOffset);
};
Joint.prototype.getPosition = function() {
    const [xCenter,yCenter] = this.getTargetCenter();

    let {angle,distance} = this;
    angle -= this.target.angle;

    const x = Math.sin(angle) * distance;
    const y = Math.cos(angle) * distance;

    return [xCenter+x,yCenter+y];
};
Joint.prototype.getTargetCenter = function() {
    const {target} = this;

    const [x,y] = target.getCenter();

    const xCenter = target.x + x;
    const yCenter = target.y + y;

    return [xCenter,yCenter];
}

function Joints(joints,coordinateBase=1) {
    const jointContainer = new Object();

    for(const jointData of joints) {
        let [name,x,y] = jointData;
        x /= coordinateBase, y /= coordinateBase;

        const joint = new Joint(this,name,x,y);
        jointContainer[name] = joint;
    }

    const getJoint = name => {
        if(!(name in jointContainer)) return null;
        const joint = jointContainer[name];
        return joint;
    };
    this.getJoint = getJoint;
}
export default Joints;
