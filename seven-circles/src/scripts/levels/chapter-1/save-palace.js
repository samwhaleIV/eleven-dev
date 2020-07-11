import {SaveStone,HellGate,AddPalaceFloor} from "../helper.js";

function SavePalace({world}) {

    world.setMap("c1-save-palace");
    AddPalaceFloor(world);
    world.camera.padding = false;
    world.addPlayer(2.5,6,"down");

    const saveStone = new SaveStone(world,5,5);

    const startGate = new HellGate(world,2,3,true,0,()=>{
        world.transitionLast();
    });
    const endGate = new HellGate(world,8,3,false,1,()=>{
        world.transitionNext();
    });

    this.start = () => {
        startGate.close();
        return false;
    };

    this.interact = data => {
        if(saveStone.tryInteract(data)) return;
        if(startGate.tryInteract(data)) return;
        if(endGate.tryInteract(data)) return;
    };

    world.setTriggers([
        [1,()=>endGate.open(),true]
    ]);

}
export default SavePalace;
