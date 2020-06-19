import AnimationPlayer from "../../animation-player.js";

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

    const animationPlayer = new AnimationPlayer(type);
    this.animationPlayer = animationPlayer;

    this.collides = true;
    this.collisionType = Eleven.CollisionTypes.ProjectileTarget;
    let fireStrength = 1;

    this.extinguish = () => {
        fireStrength -= 0.99;
        if(fireStrength < 0 && this.remove) this.remove();
    };
    
    this.update = ({deltaSecond}) => {
        if(fireStrength < 1 && fireStrength > 0) {
            fireStrength += 3 * deltaSecond;
        }
    };

    this.render = (context,x,y,width,height,time) => {
        const startAlpha = context.globalAlpha;
        context.globalAlpha = fireStrength;
        animationPlayer.render(context,x,y,width,height,time);
        context.globalAlpha = startAlpha;
    };
}

function AddFireSprite(world,type,x,y) {
    const fireSprite = new FireSprite(world,type,x,y);
    const {spriteLayer} = world;

    const spriteID = spriteLayer.add(fireSprite);
    fireSprite.remove = () => spriteLayer.remove(spriteID);

    return fireSprite;
}
export default AddFireSprite;
