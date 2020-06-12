import {SaveStone,Teleporter,InstallLevelChainTriggers} from "../helper.js";
import ObjectiveText from "../../helper/objective-text.js";

function MazeHell({world,fromNextMap}) {
    world.setMap("maze-hell");
    const {camera} = world;
    camera.padding = true;

    const objective = new ObjectiveText(world);

    if(fromNextMap) {
        const player = world.addPlayer(61,66);
        player.direction = "up";
    } else {
        objective.set("Find your way through the maze!","escape");
        const player = world.addPlayer(4,2);
        player.direction = "down";
    }

    const saveStone = new SaveStone(world,59,64);
    const teleporter = new Teleporter(world,[[56,66,47,68]]);

    this.interact = data => {
        if(data.value === 16) {
            world.say("I've been trying to get through this maze for longer than I can remember. I even left arrows to help me find my place. I've had no luck.");
            return;
        }
        if(teleporter.tryInteract(data)) {
            if(objective.status === "escape") {
                objective.close();
            }
            return;
        };
        if(saveStone.tryInteract(data)) return;
    };
    
    InstallLevelChainTriggers(world);
}
export default MazeHell;
