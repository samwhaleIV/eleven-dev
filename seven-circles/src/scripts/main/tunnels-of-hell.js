import KeyDoor from "../helper/key-door.js";
import PickupField from "../helper/pickup-field.js";
import AddColorBackground from "../helper/color-background.js";

function TunnelsOfHell(world) {
    world.setMap("tunnels-of-hell");
    AddColorBackground(world,`rgb(20,0,0)`);

    const player = world.addPlayer(4,3.5);
    player.direction = "down";

    const doors = KeyDoor.getDoors(world,[
        [8,14,"verticalRed"],
        [6,8,"verticalYellow"],
        [25,13,"verticalBlue"],
        [20,2,"horizontalGreen"],
        [48,6,"horizontalGreen"],
        [37,5,"horizontalYellow"],
        [52,8,"verticalPink"]
    ]);

    this.useKey = doors.handler;

    const pickupField = new PickupField(world,[
        [4,15,"red-key"],
        [8,9,"green-key"],
        [21,1,"pink-key"],
        [30,3,"blue-key"],
        [49,13,"yellow-key"]
    ]);

    const endWallLeft = new KeyDoor(world,57,8,"grayDoor",true);
    const endWallRight = new KeyDoor(world,71,8,"grayDoor",false);

    this.interact = data => {
        if(pickupField.tryPickup(data)) return;
        if(data.value === 16) endWallRight.toggle();
    };

    world.setTriggerHandlers([[1,()=>endWallLeft.close(),true]]);
}
export default TunnelsOfHell;
