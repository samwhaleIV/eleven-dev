import PillParticles from "./pill-particles.js";
const GROW_EFFECT = PillParticles.Grow;
const SHRINK_EFFECT = PillParticles.Shrink;

const {ResourceManager, AudioManager} = Eleven;

const ANIMATION_DURATION = 250;

const particleEffect = async (world,player,grow) => {
    PillParticles.Emit(world,player,grow ? GROW_EFFECT : SHRINK_EFFECT);
};

const scale = (player,scale) => {
    if(!player.scale) player.scale = 1;
    const {hitBox} = player;

    const endData = {};
    const startData = {
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height
    };
    const animationData = {
        start: startData,
        end: endData
    };

    if(player.scale * scale === 1) {
        const {baseSize} = player;

        endData.width = baseSize.width;
        endData.height = baseSize.height;

        hitBox.width = baseSize.hitBoxWidth;
        hitBox.height = baseSize.hitBoxHeight;
    } else {
        endData.width = scale;
        endData.height = scale;

        hitBox.width = scale;
        hitBox.height = scale;
    }

    if(endData.width === 2) hitBox.width = 1.25;

    const widthDifference = startData.width - endData.width;
    const heightDifference = startData.height - endData.height;

    endData.x = startData.x + widthDifference / 2;
    endData.y = startData.y + heightDifference / 2;

    return animationData;
};

const getRanges = ({start,end}) => {
    return [
        end.height - start.width,
        end.height - start.height,
        end.x - start.x,
        end.y - start.y
    ];
};

const lerp = (v0,v1,t) => (1 - t) * v0 + t * v1;

const animate = async (world,player,data) => {
    /* All hail the behemoth! */

    world.playerController.lock();

    const {tileCollision,collisionLayer} = world;

    const collides = () => {
        let result = null;
        result = tileCollision.collides(player);
        if(result) return result;
        result = collisionLayer.collides(player);
        return result;
    };

    const hitBox = player.hitBox;

    const verticalCenter = hitBox.y + hitBox.height / 2;
    const hitBoxTop = hitBox.y;
    const hitBoxBottom = hitBox.y + hitBox.height;

    const horizontalCenter = hitBox.x + hitBox.width / 2;
    const hitBoxLeft = hitBox.x;
    const hitBoxRight = hitBox.x + hitBox.width;

    /* I told myself I wasn't going to write more mirrored dimensional code, but here we are again... */
    const tryHandleCollision = t => {
        const collision = collides();
        if(!collision) return;

        const collisionTop = collision.y, collisionBottom = collision.y + collision.height;
        const verticalHitBoxDifference = (player.height - hitBox.height) / 2;

        if(collisionBottom < verticalCenter && collisionBottom > hitBoxTop) {
            player.y = lerp(player.y,collisionBottom - verticalHitBoxDifference,t);
        } else if(collisionTop > verticalCenter && collisionTop < hitBoxBottom) {
            player.y = lerp(player.y,collisionTop + verticalHitBoxDifference - player.height,t);
        }

        const collisionLeft = collision.x, collisionRight = collision.x + collision.width;
        const horizontalHitBoxDifference = (player.width - hitBox.width) / 2;

        if(collisionRight < horizontalCenter && collisionRight > hitBoxLeft) {
            player.x = lerp(player.x,collisionRight - horizontalHitBoxDifference,t);
        } else if(collisionLeft > horizontalCenter && collisionLeft < hitBoxRight) {

            player.x = lerp(player.x,collisionLeft + horizontalHitBoxDifference - player.width,t);
        }
    };

    let updateID = null;
    await new Promise(resolve => {
        const [
            widthRange,heightRange,xRange,yRange
        ] = getRanges(data);
    
        const startX = data.start.x;
        const startY = data.start.y;
    
        const startWidth = data.start.width;
        const startHeight = data.start.height;

        const start = performance.now();

        updateID = world.dispatchRenderer.addUpdate((context,size,time)=>{
            let delta = (time.now - start) / ANIMATION_DURATION;
            if(delta < 0) {
                delta = 0;
            } else if(delta > 1) {
               const {end} = data;
               player.x = end.x;
               player.y = end.y;
               player.width = end.width;
               player.height = end.height;
               tryHandleCollision(1);
               resolve();
               return;
            }
            player.x = startX + xRange * delta;
            player.y = startY + yRange * delta;
            player.width = startWidth + widthRange * delta;
            player.height = startHeight + heightRange * delta;
            tryHandleCollision(delta);
        });

    });
    world.dispatchRenderer.removeUpdate(updateID);
    world.playerController.unlock();

};

const setPlayerSmall = player => scale(player,0.5);
const setPlayerBig = player => scale(player,2);

const setBaseSizes = player => {
    if(!player.baseSize) {
        const {hitBox} = player;
        player.baseSize = {
            width: player.width,
            height: player.height,
            hitBoxWidth: hitBox.width,
            hitBoxHeight: hitBox.height
        };
    }
};

function MakePlayerBig(world) {
    const {player} = world;
    setBaseSizes(player);
    let animationData = null;
    switch(player.scale) {
        case 2: return false;
        default:
            animationData = setPlayerBig(player);
            player.scale = 2;
            break;
        case 0.5:
            animationData = setPlayerBig(player);
            player.scale = 1;
            break;
    }
    if(animationData) {
        animate(world,player,animationData);
        world.playSound("Grow");
        particleEffect(world,player,true);
    }
    return true;
}

function MakePlayerSmall(world) {
    const {player} = world;
    setBaseSizes(player);
    let animationData = null;
    switch(player.scale) {
        case 0.5: return false;
        default:
            animationData = setPlayerSmall(player);
            player.scale = 0.5;
            break;
        case 2:
            animationData = setPlayerSmall(player);
            player.scale = 1;
            break;
    }
    if(animationData) {
        animate(world,player,animationData);
        world.playSound("Shrink");
        particleEffect(world,player,false);
    }
    return true;
}

export {MakePlayerBig,MakePlayerSmall};
