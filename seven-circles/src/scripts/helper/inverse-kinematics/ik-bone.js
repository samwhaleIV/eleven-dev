function IKBone(
    parent,length,renderer,width,anchorPoint
) {
    this.parent = parent;

    this.height = length, this.width = width || 0.05;
    this.angle = 0, this.x = 0, this.y = 0;
    this.length = length * (isNaN(anchorPoint) ? 1 : anchorPoint);

    const renderBone = renderer ? renderer : (context,x,y,width,height) => {
        context.fillStyle = "red";
        context.fillRect(x,y,width,height);
    };

    this.child = null; //Could be changed to a set to allow for multiple children

    this.render = (context,x,y,width,height) => {
        const transform = context.getTransform();

        context.translate(x,y);
        context.rotate(this.angle);
        context.translate(-x,-y);

        renderBone(context,x,y,width,height);

        context.setTransform(transform);
    };

    this.update = () => {
        const {child} = this; if(!child) return;
        const [x,y] = this.getLocation();
        child.x = x, child.y = y;
    };
}
IKBone.prototype.getLocation = function() {
    /* The end of the bone, aka the joint: Not the start of the bone */
    let {angle,length} = this;

    return [this.x + -Math.sin(angle)*length,this.y + Math.cos(angle)*length];
};
IKBone.prototype.addBone = function(...parameters) {
    const childBone = new IKBone(this,...parameters);
    this.child = childBone;
    return childBone;
}
export default IKBone;
