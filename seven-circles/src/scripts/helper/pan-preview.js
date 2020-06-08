const DEFAULT_DELAY = 2500;
const DEFAULT_TILES_PER_SECONDS = 15;

const getTravelTime = (x1,y1,x2,y2,tilesPerSecond) => {
    const distance = Math.hypot(x1-x2,y1-y2);
    const travelTime = 1000 * distance / tilesPerSecond;
    return travelTime;
};

async function PanPreview({world,x,y,tilesPerSecond,delay,middleEvent,endX,endY}) {
    if(isNaN(tilesPerSecond)) tilesPerSecond = DEFAULT_TILES_PER_SECONDS;
    if(isNaN(delay)) delay = DEFAULT_DELAY;

    const {camera, spriteFollower} = world;

    spriteFollower.disable();

    const target = [x,y], start = [camera.x,camera.y];

    const getTravel = () => {
        return getTravelTime(start[0],start[1],target[0],target[1],tilesPerSecond);
    };

    await camera.moveTo(target[0],target[1],getTravel());
    if(middleEvent) middleEvent();
    await frameDelay(delay);

    if(!isNaN(endX)) start[0] = endX; if(!isNaN(endY)) start[1] = endY;
    await camera.moveTo(start[0],start[1],getTravel());

    spriteFollower.enable();
}
export default PanPreview;
