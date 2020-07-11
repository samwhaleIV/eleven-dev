import AnchorBody from "./anchor-body.js";
import IKBone from "./ik-bone.js";
import GetSheetRenderer from "./sheet-renderer.js";

function IKSprite(
    image,baseSize,sheetX,sheetY,width,height,joints
) {
    this.x = 0, this.y = 0;
    this.collides = false;

    this.angle = 0;
    this.width = width; this.height = height;

    const renderer = GetSheetRenderer(
        image,baseSize,sheetX,sheetY,width,height
    );

    this.render = (context,x,y,width,height) => {
        const centerX = x + width / 2, centerY = y + height / 2;
        const transform = context.getTransform();

        context.translate(centerX,centerY);
        context.rotate(this.angle);
        context.translate(-centerX,-centerY);

        renderer(context,x,y,width,height);

        context.setTransform(transform);
    };

    this.bones = [];

    const updateBone = bone => {
        const [x,y] = bone.parent.getLocation();
        bone.x = x, bone.y = y;
    };

    this.update = () => {
        for(const bone of this.bones) updateBone(bone);
    };

    AnchorBody.call(this,joints,baseSize);
}
IKSprite.prototype.getBone = function(anchor,...parameters) {
    anchor = this.getAnchor(anchor);
    const bone = new IKBone(anchor,...parameters);
    this.bones.push(bone);
    return bone;
};

export default IKSprite;
