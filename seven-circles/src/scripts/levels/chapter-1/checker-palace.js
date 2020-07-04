import {AddPalaceFloor,HellGate,Fissure,CheckerBoard,ObjectiveText} from "../helper.js";

function CheckerPalace({world,fromNextLevel}) {
    world.setMap("checker-palace");
    if(fromNextLevel) {
        world.addPlayer(34.545,16.9375,"down");
    } else {
        world.addPlayer(9,3.5,"down");
    }

    const objective = new ObjectiveText(world);
    objective.set("Navigate through the pocket dimension!");

    const fissure = new Fissure(world,17,true);

    const endGate = new HellGate(world,34,14,false,0,()=>{
        world.transitionNext();
    });
    AddPalaceFloor(world);
    world.camera.verticalPadding = true;

    CheckerBoard(world,31,18,11,9,()=>{
        world.message("A nearby portal gate was activated!");
        objective.set("Travel through the portal gate!");
        endGate.open();
    });

    this.interact = data => {
        if(endGate.tryInteract(data)) return;
        if(fissure.tryInteract(data)) return;
    };
}
export default CheckerPalace;

