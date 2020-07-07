import {AddPalaceFloor,HellGate,Fissure,CheckerBoard,ObjectiveText} from "../helper.js";

function CheckerPalace({world,fromNextLevel}) {
    world.setMap("checker-palace");
    if(fromNextLevel) {
        world.addPlayer(34.545,16.9375,"down");
    } else {
        world.addPlayer(9,3.5,"down");
    }

    const objective = new ObjectiveText(world);

    const fissure = new Fissure(world,17,true);

    this.start = () => {
        objective.set("Navigate through the pocket dimension!");
    };

    const endGate = new HellGate(world,34,14,false,0,()=>{
        world.transitionNext();
    });
    AddPalaceFloor(world);
    world.camera.verticalPadding = true;

    const checkerBoard = new CheckerBoard(world,31,18,11,9,()=>{
        world.message("A nearby portal gate was activated!");
        objective.set("Travel through the portal gate!");
        endGate.open();
    });

    this.interact = data => {
        if(checkerBoard.tryInteract(data)) return;
        if(endGate.tryInteract(data)) {
            if(endGate.isOpen) objective.close();
            return;
        }
        if(fissure.tryInteract(data)) return;
    };
}
export default CheckerPalace;

