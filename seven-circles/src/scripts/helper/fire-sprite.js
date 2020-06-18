import AnimationPlayer from "../../animation-player.js";

/* Water color: 142, 236, 255, 176 (Alpha) */

const FIRE_TYPES = {
    Red: {
        imageName: "effects/fire",
        frameWidth: 18,
        frameHeight: 16,
        frameTime: 90
    },
    Yellow: {
        imageName: "effects/fire-yellow",
        frameWidth: 14,
        frameHeight: 14,
        frameTime: 90
    }
};
FIRE_TYPES.Default = FIRE_TYPES.Red;

function FireSprite(world,type,x,y) {
    if(type) type = FIRE_TYPES[type];
    if(!type) type = FIRE_TYPES.Default;
    
    const baseSize = world.grid.baseTileSize;

    this.width = type.frameWidth / baseSize;
    this.height = type.frameHeight / baseSize;

    this.x = x + 0.5 - this.width / 2;
    this.y = y + 1 - this.height;

    this.collides = true;

    const animationPlayer = new AnimationPlayer(type);
    this.animationPlayer = animationPlayer;
    this.render = animationPlayer.render;
}

function AddFireSprite(world,type,x,y) {
    const fireSprite = new FireSprite(world,type,x,y);
    const {spriteLayer} = world;

    const spriteID = spriteLayer.add(fireSprite);
    fireSprite.remove = () => spriteLayer.remove(spriteID);

    return fireSprite;
}
export default AddFireSprite;
