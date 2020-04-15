import AddMilkBackground from "../helper/backgrounds/milk-background.js";
import KeyDoor from "../helper/doors/key-door.js";
import PickupField from "../helper/pickup-field.js";
import RiverRocks from "../helper/river-rocks.js";

function RiverHell({world,lastScript}) {
    world.setMap("river-hell");
    AddMilkBackground(world);

    const player = world.addPlayer();
    if(lastScript === "TDB") {
        player.setPosition(7,81);
        player.direction = "up";
    } else {
        player.setPosition(7,3);
        player.direction = "down";
    }

    const doors = KeyDoor.getDoors(world,this[
        [24,5,"verticalRed"]
    ]);

    const riverRocks = new RiverRocks(world,this);

    const pickupField = new PickupField(world,[
        [5,2,"bomb"],
        [8,5,"bomb"],
        [6,52,"bomb"],
        [8,83,"bomb"],
        [4,63,"red-key"],
        [26,6,"yellow-key"]
    ]);

    this.unload = () => {
        inventory.clearItem("bomb");
        inventory.clearItem("red-key");
        inventory.clearItem("yellow-key");
    };
    this.unload();

    this.interact = data => {
        if(doors.tryInteract(data)) return;
        if(pickupField.tryPickup(data)) return;
        if(riverRocks.tryPickup(data)) return;

        if(data.value === 16) {
            world.say("Can you save my friends!");
        } else if(data.value === 17) {
            world.say("Freedom! Thank you kind soul!");
        }
    };
}
export default RiverHell;
