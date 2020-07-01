import {AddPalaceFloor,HellGate, Fissure} from "../helper.js";

function CheckerPalace({world,fromNextLevel}) {
    world.setMap("checker-palace");
    if(fromNextLevel) {
        world.addPlayer(34.545,16.9375,"down");
    } else {
        world.addPlayer(9,3.5,"down");
    }

    const fissure = new Fissure(world,17,true);

    const endGate = new HellGate(world,34,14,false,0,()=>{
        world.transitionNext();
    });
    AddPalaceFloor(world);
    world.camera.verticalPadding = true;

    this.interact = data => {
        if(endGate.tryInteract(data)) return;
        if(fissure.tryInteract(data)) return;
    };
}
export default CheckerPalace;

