const DEFAULT_DELAY = 2500;
const DEFAULT_TILES_PER_SECONDS = 15;

async function PanPreview({world,x,y,tilesPerSecond,delay,middleEvent}) {
    if(isNaN(tilesPerSecond)) tilesPerSecond = DEFAULT_TILES_PER_SECONDS;
    if(isNaN(delay)) delay = DEFAULT_DELAY;

    const {camera, spriteFollower} = world;

    spriteFollower.disable();

    const target = [x,y], start = [camera.x,camera.y];

    const distance = Math.hypot(target[0]-start[0],target[1]-start[1]);
    const travelTime = 1000 * distance / tilesPerSecond;

    await camera.moveTo(target[0],target[1],travelTime);
    if(middleEvent) middleEvent();
    await Eleven.FrameTimeout(delay);

    await camera.moveTo(start[0],start[1],travelTime);

    spriteFollower.enable();
}
export default PanPreview;
