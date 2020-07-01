import Constants from "../../../constants.js";
import GetInteractionStart from "../self/get-interaction-start.js";

const INTERACTION_ID = GetInteractionStart();

const {ResourceManager,AudioManager} = Eleven;

const WORLD_HAS_NO_PLAYER = () => {
    console.warn("The SaveStone must be initialized after a player is added to the world!");
};

function SaveStone(world,x,y) {
    const {lifetime,player} = world;
    if(!player) WORLD_HAS_NO_PLAYER();

    world.setInteractionTile(x,y,INTERACTION_ID);
    world.setCollisionTile(x,y,1);

    if(player && world.lastScript === Constants.GamePreloadScript) {
        lifetime.resumePosition(world.player);
    }

    const saveSound = ResourceManager.getAudio("save");

    this.tryInteract = ({value}) => {
        if(value !== INTERACTION_ID) return false;

        lifetime.serialize(world.player); lifetime.save();

        AudioManager.play(saveSound);

        world.message("Game saved! The save stone will remember where you belong.");
        return true;
    };
}
export default SaveStone;
