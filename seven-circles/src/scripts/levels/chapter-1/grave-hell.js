import {AddFixedWaterBackground,Teleporter,GetSwitchDoors,KeyDoor,PickupField} from "../helper.js";

function GraveHell({world,inventory}) {
    world.setMap("grave-hell");
    world.camera.padding = true;
    AddFixedWaterBackground(world,2,12,6,8);
    const player = world.addPlayer(14.5,0.25);
    player.direction = "down";

    const teleporter = new Teleporter(world,[[6,8,6,22]]);
    const switchDoors = GetSwitchDoors(world,[[13,25,"yellow",false]],[[15,17,"yellow"]]);
    const keyDoors = KeyDoor.getDoors(world,this,[[28,10,"verticalRed"]]);
    const pickupField = new PickupField(world,[[19,25,"red-key",1,true,false]]);

    this.unload = () => {
        inventory.clear("red-key");
    };
    this.unload();

    this.interact = data => {
        if(keyDoors.tryInteract(data)) return;
        if(pickupField.tryPickup(data)) return;
        if(switchDoors.tryInteract(data)) return;
        if(teleporter.tryInteract(data)) return;
    }
}
export default GraveHell;
