import {AddPalaceFloor,HellGate,Fissure,CheckerBoard} from "../helper.js";

function CheckerPalace({world,fromNextLevel}) {
    world.setMap("checker-palace");
    if(fromNextLevel) {
        world.addPlayer(34.545,16.9375,"down");
    } else {
        world.addPlayer(9,3.5,"down");
    }

    world.player.setPosition(31.928571428572035,17.49107142857128); //DEV POSITION

    const fissure = new Fissure(world,17,true);

    const endGate = new HellGate(world,34,14,false,0,()=>{
        world.transitionNext();
    });
    AddPalaceFloor(world);
    world.camera.verticalPadding = true;

    CheckerBoard(world,31,18,11,9,()=>{
        world.message("A nearby gate was activated!");
        endGate.open();
    });

    this.interact = data => {
        if(endGate.tryInteract(data)) return;
        if(fissure.tryInteract(data)) return;
    };
}
export default CheckerPalace;

