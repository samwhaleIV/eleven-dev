import Constants from "../../../constants.js";
import GetInteractionStart from "../self/get-interaction-start.js";

const INTERACTION_ID = GetInteractionStart();

const WORLD_HAS_NO_PLAYER = () => {
    console.warn("The SaveStone must be initialized after a player is added to the world!");
};

function SaveStone(world,x,y) {
    const {lifetime,player} = world;
    if(!player) WORLD_HAS_NO_PLAYER();

    world.setInteractionTile(x,y,INTERACTION_ID);
    world.setCollisionTile(x,y,1);

    if(player && world.scriptData.fromPreload) {
        lifetime.resumePosition(world.player);
    }

    this.tryInteract = ({value}) => {
        if(value !== INTERACTION_ID) return false;

        lifetime.serialize(world.player); lifetime.save();

        world.playSound("Save");

        world.message("Game saved! The save stone remembers where you belong.");
        return true;
    };
}
export default SaveStone;
