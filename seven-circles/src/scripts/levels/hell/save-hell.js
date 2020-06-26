import {SaveStone,InstallLevelChainTriggers, AddNamedBackground, AddFixedWaterBackground} from "../helper.js";

function SaveHell({world,fromNextMap}) {
    world.setMap("save-hell");
    world.camera.verticalPadding = true;
    AddNamedBackground(world,"hell");
    AddFixedWaterBackground(world,6,6,3,3);
    if(fromNextMap) {
        world.addPlayer(7,13.75,"up");
    } else {
        world.addPlayer(7,0.25,"down");
    }
    const saveStone = new SaveStone(world,7,7);
    this.interact = data => {
        if(data.value === 16) {
            world.sayNamed("I can wait forever if I have to.","Mysterious Lamp","r");
        } else {
            saveStone.tryInteract(data);
        }
    }
    InstallLevelChainTriggers(world,"up","down");
}
export default SaveHell;
