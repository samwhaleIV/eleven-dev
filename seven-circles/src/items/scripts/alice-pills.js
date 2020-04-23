import PillParticles from "./pill-particles.js";
const GROW_EFFECT = PillParticles.Grow;
const SHRINK_EFFECT = PillParticles.Shrink;

const {ResourceManager, AudioManager} = Eleven;

const ANIMATION_DURATION = 250;

const playSound = async grow => {
    const sound = ResourceManager.getAudio(
        grow ? "grow" : "shrink"
    );
    AudioManager.play(sound);
};

const particleEffect = async ({world,player},grow) => {
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

        hitBox.width = scale; hitBox.height = scale;
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

const animate = async (data,{player,world}) => {
    world.playerController.lock();

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
               resolve();
               return;
            }
            player.x = startX + xRange * delta;
            player.y = startY + yRange * delta;
            player.width = startWidth + widthRange * delta;
            player.height = startHeight + heightRange * delta;
        });

    });
    world.dispatchRenderer.removeUpdate(updateID);
    world.playerController.unlock();

};

const makePlayerSmall = ({player}) => scale(player,0.5);
const makePlayerBig = ({player}) => scale(player,2);

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

function BigPill() {
    this.action = data => {
        const {player} = data;
        setBaseSizes(player);
        let animationData = null;
        switch(player.scale) {
            case 2: return false;
            default:
                animationData = makePlayerBig(data);
                player.scale = 2;
                break;
            case 0.5:
                animationData = makePlayerBig(data);
                player.scale = 1;
                break;
        }
        if(animationData) {
            animate(animationData,data);
            playSound(true);
            particleEffect(data,true);
        }
        return true;
    };
}
function SmallPill() {
    this.action = data => {
        const {player} = data;
        setBaseSizes(player);
        let animationData = null;
        switch(player.scale) {
            case 0.5: return false;
            default:
                animationData = makePlayerSmall(data);
                player.scale = 0.5;
                break;
            case 2:
                animationData = makePlayerSmall(data);
                player.scale = 1;
                break;
        }
        if(animationData) {
            animate(animationData,data);
            playSound(false);
            particleEffect(data,false);
        }
        return true;
    };
}

export default BigPill;
export {BigPill,SmallPill};
