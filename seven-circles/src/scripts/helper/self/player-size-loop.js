const SIZE_DURATION = 100;

const PlayerSizeLoop = (world,newWidth) => {
    const {dispatchRenderer,player} = world;
    return new Promise(resolve => {
        const startsColliding = player.collides;
        player.collides = false;
        const startWidth = player.width;
        const distance = newWidth - startWidth;
        const startTime = performance.now();
        const updateID = dispatchRenderer.addUpdate((context,size,time)=>{
            let t = (time.now - startTime) / SIZE_DURATION;
            if(t > 1) {
                dispatchRenderer.removeUpdate(updateID);
                player.width = newWidth;
                player.xOffset = 0;
                if(startsColliding) player.collides = true;
                resolve();
                return;
            } else if(t < 0) t = 0;
            player.width = startWidth + distance * t;
            player.xOffset = (1-player.width) / 2;
        },player.zIndex-1);
    });
};
export default PlayerSizeLoop;
