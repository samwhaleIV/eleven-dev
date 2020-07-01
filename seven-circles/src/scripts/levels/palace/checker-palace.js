import {AddPalaceFloor,HellGate} from "../helper.js";

function CheckerPalace({world}) {
    world.setMap("checker-palace");
    if(fromNextLevel) {
        world.addPlayer(34.545,16.9375,"down");
    } else {
        world.addPlayer(9,3.5,"down");
    }
    const endGate = new HellGate(world,34,14,true,0,()=>{
        world.transitionNext();
    });
    AddPalaceFloor(world);
    world.camera.verticalPadding = true;

    this.interact = data => {
        if(endGate.tryInteract(data)) return;
    };
}
export default CheckerPalace;

