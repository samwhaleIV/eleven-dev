import GetInteractionStart from "../self/get-interaction-start.js";
import PlayerSizeLoop from "../self/player-size-loop.js";

const INTERACTION_START = GetInteractionStart();

const TRAVEL_TIME = 300;

const NO_PLAYER = () => {
    throw Error("No player or player controller! Initialize the teleporters after adding the player to the level!");
};

function Teleporter(world,beacons) {

    const {playerController,camera,spriteFollower,player} = world;
    if(!playerController || !player) NO_PLAYER();

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

    const teleportPlayer = async (x,y) => {
        const startWidth = player.width;
        spriteFollower.disable();

        await PlayerSizeLoop(world,0);
        world.playSound("TeleporterStart");

        player.x = x - (player.hitBox.width / 2) - 0.5;
        player.y = y - player.yOffset;

        player.direction = "right";

        await camera.moveTo(player,TRAVEL_TIME);

        world.playSound("TeleporterEnd");
        await PlayerSizeLoop(world,startWidth);

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
