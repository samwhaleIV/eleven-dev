import {} from "../helper.js";
import WatcherBeam from "../../../weapons/watcher-beam.js";

const {UVTCReflection,ResourceManager} = Eleven;

function PondHell({world,fromNextMap}) {

    world.setMap("pond-hell");
    const verticalStart = 0.7;
    const player = fromNextMap ? world.addPlayer(48,0) : world.addPlayer(5,0);
    player.y = verticalStart;
    player.direction = "down";
    world.camera.padding = true;
    const watcherImage = ResourceManager.getImage("the-watcher");

    const watchers = [];
    const addWatcher = (x,y,direction=0,tickOffset=0,rotatePolarity=true,tickMod=12) => {
        tickOffset *= tickMod;
        const watcher = world.addNPC(x,y,watcherImage,2,2);
        watcher.collisionType = 0;
        watcher.zIndex = player.zIndex + 1;
        watcher.collides = false;
        watchers.push(watcher);
        watcher.setWeapon(WatcherBeam);
        Object.assign(watcher,{direction,tickMod,rotatePolarity,tickOffset});
        return watcher;
    };

    [
        [6,5,0,1/2,true],
        [15,5,3,0,false],
        [7,12,1,3/4,false],
        [21,12,2,1/2,true],
        [25,5.75,0,1/4,false],
        [31,4.75,0,1/2,false],
        [37,4.75,2,0,true],
        [32.5,11.5,1,3/4,true],
        [43,13.5,3,3,false],
        [47,5.75,2,1/2,true]
    ].forEach(data=>addWatcher(...data));

    let runNPCCycle = true;

    let tickNumber = 0;
    const tickRate = 120;

    this.watcherBeamCollided = () => {
        runNPCCycle = false;
        world.playerController.lock();
        (async ()=>{
            await world.message("You've been spotted!");
            world.transitionSelf();
        })();
    };

    const NPCCycle = async () => {
        while(runNPCCycle) {
            for(const watcher of watchers) {
                const {tickMod,tickOffset,rotatePolarity} = watcher;
                if((tickNumber+tickOffset) % tickMod !== 0) continue;
                let direction = watcher.direction;
                if(rotatePolarity) {
                    if(++direction > 3) direction = 0;
                } else {
                    if(--direction < 0) direction = 3;
                }
                watcher.direction = direction;
                watcher.getWeapon().checkCollision();
            }
            tickNumber++;
            await delay(tickRate);
        }
    };

    this.unload = () => runNPCCycle = false;
    this.start = () => {
        NPCCycle();
        return false;
    };

    const ladderSpeed = 2, waterSpeed = 1.3;
    player.velocity = waterSpeed;
    player.hitBox.height = 0.75;
    player.yOffset = 0.125;

    const playerBuffer = new OffscreenCanvas(0,0);
    const bufferContext = playerBuffer.getContext("2d",{alpha:true});


    const fullDeepDifference = -0.25;
    const sinkDistance = 0.75;
    const sinkStart = 1 / 12;
    const sinkLadders = [[5,sinkStart],[48,sinkStart]];

    const {grid,dispatchRenderer} = world;
    const worldHalfHeight = grid.width / 2;

    const ladderSpeedThreshold = 0.9;
    const waterBlipColor = "#191E19";

    const blipWidthEastWest = 6, blipWidthNorthSouth = 10;

    const renderBase = player.render;
    player.render = (context,x,y,width,height,time) => {
        const [ladderX,ladderY] = sinkLadders[player.x < worldHalfHeight ? 0 : 1];

        const xDistance = Math.abs(player.x - ladderX);
        const yDistance = player.y < ladderY ? 0 : Math.abs(player.y - ladderY);

        let sinkT = Math.hypot(xDistance,yDistance) / sinkDistance;
        if(sinkT > 1) sinkT = 1; else if(sinkT < 0) sinkT = 0;
        
        const heightClip = 1 + sinkT * fullDeepDifference;

        const onLadder = heightClip > ladderSpeedThreshold;
        player.velocity = onLadder ? ladderSpeed : waterSpeed;

        playerBuffer.width = width; playerBuffer.height = height;
        bufferContext.imageSmoothingEnabled = false;

        renderBase(bufferContext,0,0,width,height,time);
        height *= heightClip;
        context.drawImage(playerBuffer,0,0,width,height,x,y,width,height);

        if(onLadder) return;
        const waterBlipPixelSize = 0.0625 * width;
        const blipWidth = waterBlipPixelSize * (
            world.player.direction % 2 === 0 ? blipWidthNorthSouth : blipWidthEastWest
        );
        context.fillStyle = waterBlipColor;
        context.fillRect(
            x+width/2-blipWidth/2,Math.ceil(y+height-waterBlipPixelSize),
            blipWidth,waterBlipPixelSize
        );
    };

    const reflector = UVTCReflection.getScrollable(grid,null,null,-0.5);
    dispatchRenderer.addBackground(reflector.clear);
    dispatchRenderer.addResize(reflector.resize);
    dispatchRenderer.addFinalize(reflector.render);
}
export default PondHell;
