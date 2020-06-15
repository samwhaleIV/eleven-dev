import {} from "../helper.js";

const {UVTCReflection,ResourceManager} = Eleven;

function PondHell({world,fromNextMap}) {
    world.setMap("pond-hell");
    const verticalStart = 0.91;
    const player = fromNextMap ? world.addPlayer(48,0) : world.addPlayer(5,0);
    player.y = verticalStart;
    player.direction = "down";
    world.camera.padding = true;

    const watcherImage = ResourceManager.getImage("the-watcher");
    const watchers = [];
    const addWatcher = (x,y) => {
        const watcher = world.addNPC(x,y,watcherImage,2,2);
        watcher.collides = false;
        watchers.push(watcher);
        return watcher;
    };
    const w1 = addWatcher(6,5);
    Object.assign(globalThis,{w1});

    const ladderSpeed = 2, waterSpeed = 1.5;
    player.velocity = waterSpeed;
    player.hitBox.height /= 2;

    const playerBuffer = new OffscreenCanvas(0,0);
    const bufferContext = playerBuffer.getContext("2d",{alpha:true});

    const renderBase = player.shiftRenderBase();

    const fullDeepDifference = -0.25;
    const sinkDistance = 0.75;
    const sinkLadders = [[5,0.5],[48,0.5]];

    const {grid,dispatchRenderer} = world;
    const worldHalfHeight = grid.width / 2;

    const ladderSpeedThreshold = 0.9;
    const waterBlipColor = "#191E19";

    const blipWidthEastWest = 6, blipWidthNorthSouth = 10;

    player.addRender((context,x,y,width,height,time)=>{
        const [ladderX,ladderY] = sinkLadders[player.y < worldHalfHeight ? 0 : 1];

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
    });

    const reflector = UVTCReflection.getScrollable(grid,null,null,-0.5);
    dispatchRenderer.addBackground(reflector.clear);
    dispatchRenderer.addResize(reflector.resize);
    dispatchRenderer.addFinalize(reflector.render);
}
export default PondHell;
