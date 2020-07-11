import {InstallLevelChainTriggers} from "../helper.js";
import SaveStone from "../../helper/interactables/save-stone.js";

function PrepareHell({world,fromNextMap}) {
    world.setMap("c1-prepare");
    if(fromNextMap) {
        world.addPlayer(18,17,"up");
    } else {
        world.addPlayer(5,2,"down");
    }
    world.camera.padding = true;
    const saveStone = new SaveStone(world,4,3);
    InstallLevelChainTriggers(world,"up","down");
    this.interact = data => {
        if(saveStone.tryInteract(data)) {
            return;
        }
        if(data.value === 16) {
            world.sayNamed("Do you even know where you're going?","Mysterious Lamp","r");
            return;
        }
    }
}
export default PrepareHell;
