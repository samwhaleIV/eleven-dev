import KeyDoor from "../helper/doors/key-door.js";
import PickupField from "../helper/pickup-field.js";
import AddColorBackground from "../helper/color-background.js";
import SpriteDoor from "../helper/doors/sprite-door.js";
import ObjectiveText from "../helper/objective-text.js";
import KeyWeapon from "../../weapons/key-weapon.js";
import {AddFixedMilkBackground} from "../helper/backgrounds/milk-background.js";
import FadeTransition from "../helper/fade-transition.js";

function TunnelsOfHell(world) {
    world.setMap("tunnels-of-hell");
    AddColorBackground(world,`rgb(20,0,0)`);

    AddFixedMilkBackground(world,81,7,5,5,{
        width: 1,height: 1,y: 10.5,x: 83
    });

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
    this.useKey = doors.useKey;

    const pickupField = new PickupField(world,[
        [4,15,"red-key"],
        [8,9,"green-key"],
        [21,1,"pink-key"],
        [30,3,"blue-key"],
        [49,13,"yellow-key"]
    ]);

    const endWallLeft = new SpriteDoor(world,57,8,"grayDoor",true,2000,48);
    const endWallRight = new SpriteDoor(world,71,8,"grayDoor",false,300,49);

    const objective = new ObjectiveText(world);

    this.keyDoorOpened = door => {
        if(objective.status === "open-red-door" && door.color === "red") {
            objective.close();
        }
    };

    player.watchWeaponChange(weapon=>{
        if(weapon && objective.status === "equip-red-key" &&
           weapon.name === KeyWeapon.name && weapon.color === "red"
        ) {
            objective.set("Open the red door!","open-red-door");
        }
    });

    const lockDoorInteraction = door => {
        if(door.opened) return;
        world.message("The door is closed!");
    };

    this.interact = data => {
        const pickedUpItem = pickupField.tryPickup(data);
        if(pickedUpItem) {
            if(pickedUpItem === "red-key" && objective.status === "get-red-key") {
                objective.set(["Access your items","and get your key!"],"equip-red-key");
            }
            return;
        }
        if(doors.tryInteract(data)) return;

        if(endWallLeft.tryInteract(data,lockDoorInteraction) ||
          endWallRight.tryInteract(data,lockDoorInteraction)) {
            return;
        }

        if(data.value === 16) endWallRight.toggle();
    };

    this.postFadeStart = () => {
        objective.set("Find the red key!","get-red-key");
    };

    world.setTriggerHandlers([
        [1,()=>endWallLeft.close(),true],
        [3,()=>{FadeTransition(world,"chocolate-hell")},true]
    ]);
}
export default TunnelsOfHell;
