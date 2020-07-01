const PAUSE_DURATION = 250;
const TRANSITION_DURATION = 500;

function DramaZoom(world,x,y) {
    const {camera,spriteFollower} = world;
    const [startX,startY,startScale] = camera.getPosition();
    const [targetX,targetY,targetScale] = [x,y,Math.floor(startScale*2)];

    this.zoomIn = async doStartDelay => {
        if(spriteFollower) {
            spriteFollower.disable();
        }
        if(doStartDelay) {
            await delay(PAUSE_DURATION);
        }
        await Promise.all([
            camera.zoomTo(targetScale,TRANSITION_DURATION),
            camera.moveTo(targetX,targetY,TRANSITION_DURATION)
        ]);
        await delay(PAUSE_DURATION);
    };

    this.zoomOut = async () => {
        await delay(PAUSE_DURATION);
        await Promise.all([
            camera.zoomTo(startScale,TRANSITION_DURATION),
            camera.moveTo(startX,startY,TRANSITION_DURATION)
        ]);
        await delay(PAUSE_DURATION);
        if(spriteFollower) {
            spriteFollower.enable();
        }
    };
}
export default DramaZoom;
