import GetInteractionStart from "./get-interaction-start.js";

const INTERACTION_START = GetInteractionStart();

const TRAVEL_TIME = 300;
const SIZE_DURATION = 100;

function Teleporter(world,beacons) {

    const {playerController,camera,spriteFollower,player} = world;

    const links = new Object();

    let interactionID = INTERACTION_START;

    const getID = () => interactionID++;

    for(let i = 0;i<beacons.length;i++) {
        const [x1,y1,x2,y2] = beacons[i];

        const firstID = getID(), secondID = getID();

        links[firstID] = [x2,y2]; links[secondID] = [x1,y1];
    
        world.setInteractionTile(x1,y1,firstID);
        world.setInteractionTile(x2,y2,secondID);
        
        world.setCollisionTile(x1,y1,1);
        world.setCollisionTile(x2,y2,1);
    }

    const sizeLoop = newWidth => new Promise(resolve => {
        const {dispatchRenderer} = world;
        const startWidth = player.width;
        const distance = newWidth - startWidth;
        const startTime = performance.now();
        const updateID = dispatchRenderer.addUpdate((context,size,time)=>{
            let t = (time.now - startTime) / SIZE_DURATION;
            if(t > 1) {
                dispatchRenderer.removeUpdate(updateID);
                player.width = newWidth;
                player.xOffset = 0;
                resolve();
                return;
            } else if(t < 0) t = 0;
            player.width = startWidth + distance * t;
            player.xOffset = (1-player.width) / 2;
        },player.zIndex-1);
    });

    const teleportPlayer = async (x,y) => {
        const startWidth = player.width;
        await sizeLoop(0);

        spriteFollower.disable();

        player.x = x - (player.hitBox.width / 2) - 0.5;
        player.y = y - player.yOffset;

        player.direction = "right";

        await camera.moveTo(player,TRAVEL_TIME);

        await sizeLoop(startWidth);

        spriteFollower.enable();
        playerController.unlock();
    };

    this.tryInteract = ({value}) => {
        if(!(value in links)) return false;

        playerController.lock();
        teleportPlayer(...links[value]);
        
        return true;
    };
}
export default Teleporter;
