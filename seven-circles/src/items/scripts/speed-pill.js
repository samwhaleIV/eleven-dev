import PillParticles from "./pill-particles.js";

const {ResourceManager, AudioManager} = Eleven;

const SPEED_MODIFIER = 1.75;

const SPEED_PILL_FLAG = "speedPillActive";

const GHOST_BUFFER_SIZE = 4;
const SPRITE_SIZE = 16;

const FIRST_ALPHA = 0.6;
const LAST_ALPHA = 0.25;

function ghostAlphaLerp(t) {
    return (1 - t) * FIRST_ALPHA + t * LAST_ALPHA;
}

function Ghost(target) {
    Object.defineProperties(this,{
        x: {get: () => target.x},
        y: {get: () => target.y},
        width: {get: () => target.width},
        height: {get: () => target.height},
    });

    const bufferHeight = SPRITE_SIZE * GHOST_BUFFER_SIZE;

    const buffer = new OffscreenCanvas(
        SPRITE_SIZE*2,bufferHeight
    );
    const bufferContext = buffer.getContext("2d",{alpha:true});
    const lastRow = bufferHeight-SPRITE_SIZE;

    const bufferMeta = new Array();

    const clearSecondColumn = () => {
        bufferContext.clearRect(
            SPRITE_SIZE,0,SPRITE_SIZE,bufferHeight
        );
    };
    const copyRight = yOffset => {
        bufferContext.drawImage(
            buffer,0,0,SPRITE_SIZE,bufferHeight,
            SPRITE_SIZE,yOffset,SPRITE_SIZE,bufferHeight
        );
    };

    const copyLeft = yOffset => {
        bufferContext.drawImage(
            buffer,SPRITE_SIZE,0,SPRITE_SIZE,bufferHeight,
            0,yOffset,SPRITE_SIZE,bufferHeight
        );
    };
    const clearFirstColumn = () => {
        bufferContext.clearRect(
            0,0,SPRITE_SIZE,bufferHeight
        );
    };

    const advanceBuffer = time => {
        clearSecondColumn(); copyRight(-SPRITE_SIZE);

        clearFirstColumn(); copyLeft(0);

        target.render(bufferContext,0,lastRow,SPRITE_SIZE,SPRITE_SIZE,time);

        const metadata = {x:target.x,y:target.y};

        const playerScale = target.scale || 1;
        if(target.xOffset) metadata.x += target.xOffset / playerScale;
        if(target.yOffset) metadata.y += target.yOffset / playerScale;

        bufferMeta.push(metadata);

        if(bufferMeta.length > GHOST_BUFFER_SIZE) {
            bufferMeta.shift();
        }
    };

    this.render = (context,x,y,width,height,time) => {
        advanceBuffer(time);

        context.save();

        for(let i = 0;i<bufferMeta.length;i++) {

            const metadata = bufferMeta[i];

            const renderX = x + (metadata.x - target.x) * width;
            const renderY = y + (metadata.y - target.y) * height;

            const inverse = GHOST_BUFFER_SIZE - 1 - i;

            context.globalAlpha = ghostAlphaLerp(inverse / GHOST_BUFFER_SIZE);

            context.drawImage(buffer,
                0,SPRITE_SIZE*inverse,SPRITE_SIZE,SPRITE_SIZE,
                renderX,renderY,width,height
            );
        }

        context.restore();
    };
}

function SpeedPill() {
    this.action = ({world,player}) => {
        if(player[SPEED_PILL_FLAG]) {
            return false;
        }
        player[SPEED_PILL_FLAG] = true;

        player.oldVelocity = player.velocity;
        player.velocity *= SPEED_MODIFIER;

        const sound = ResourceManager.getAudio("grow");
        AudioManager.play(sound);
        PillParticles.Emit(world,player,PillParticles.Speed);

        world.spriteLayer.add(new Ghost(player),player.zIndex-1);

        return true;
    };
}
export default SpeedPill;
