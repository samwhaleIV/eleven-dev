import {SaveStone,InstallLevelChainTriggers,AddNamedBackground,AddFixedWaterBackground,ObjectiveText} from "../helper.js";

function SaveHell({world,fromNextMap}) {
    world.setMap("save-hell");
    world.camera.verticalPadding = true;
    AddNamedBackground(world,"hell");
    AddFixedWaterBackground(world,6,6,3,3);
    if(fromNextMap) {
        world.addPlayer(7,13.75,"up",{lowSpeed:true});
    } else {
        world.addPlayer(7,0.25,"down",{lowSpeed:true});
    }
    const objective = new ObjectiveText(world);
    objective.set("Touch the save stone!","save");
    const saveStone = new SaveStone(world,7,7);
    this.interact = data => {
        if(data.value === 16) {
            world.sayNamed("I can wait forever if I have to.","Mysterious Lamp","r");
        } else {
            if(saveStone.tryInteract(data)) {
                if(objective.status === "save") {
                    objective.close();
                }
            }
        }
    }
    InstallLevelChainTriggers(world,"up","down");
}
export default SaveHell;
