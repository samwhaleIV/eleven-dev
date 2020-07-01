import {
    GetSwitchDoors,
    PickupField,
    InstallBombAreas
} from "../helper.js";
import Fissure from "../../helper/doors/fissure.js";

function SwitchHell({world,inventory}) {
    world.setMap("switch-hell");

    const player = world.addPlayer(15,3);
    player.direction = "down";
    world.camera.padding = true;

    this.unload = () => {
        inventory.clear("bomb");
    };
    this.unload();

    const pickupField = new PickupField(world,[
        [12,17,"bomb"]
    ]);

    const switchDoors = GetSwitchDoors(world,[
        [4,1,"red",true],
        [7,1,"blue",false],
        [10,4,"red",false],
        [20,4,"blue",false],

        [2,7,"blue",true],
        [6,7,"red",true],

        [4,13,"red",false],

        [13,16,"red",true],
        [20,16,"yellow",false],
        [23,9,"blue",true]
    ],[
        [2,2,"yellow"],
        [4,8,"red"],
        [10,11,"blue"],
        [13,7,"red"],
        [24,5,"blue"]
    ]);

    InstallBombAreas(world,this);

    const fissure = new Fissure(world,16);

    this.interact = data => {
        if(pickupField.tryPickup(data)) return;
        if(switchDoors.tryInteract(data)) return;
        if(fissure.tryInteract(data)) return;
    };

    world.setTriggers([[1,()=>{world.transitionLast()},true]]);
}
export default SwitchHell;
