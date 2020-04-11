import KeyDoor from "../helper/key-door.js";
import PickupField from "../helper/pickup-field.js";
import AddColorBackground from "../helper/color-background.js";
import SpriteDoor from "../helper/sprite-door.js";
import ObjectiveText from "../helper/objective-text.js";
import KeyWeapon from "../../weapons/key-weapon.js";

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

    const endWallLeft = new SpriteDoor(world,57,8,11,12,13,4,5,true,2000);
    const endWallRight = new SpriteDoor(world,71,8,11,12,13,4,5,false,500);

    const objectiveText = new ObjectiveText(world);

    this.keyDoorOpened = door => {
        if(objectiveText.status === "open-red-door" && door.color === "red") {
            objectiveText.close();
            objectiveText.status = null;
        }
        console.log("Door opened:",door);
    };

    player.watchWeaponChange(weapon=>{
        if(weapon) {
            if(objectiveText.status === "equip-red-key" && weapon.name === KeyWeapon.name && weapon.color === "red") {
                objectiveText.text = "Open the red door!";
                objectiveText.status = "open-red-door";
            }
        }
    });

    this.interact = data => {
        const pickedUpItem = pickupField.tryPickup(data);
        if(pickedUpItem) {
            if(pickedUpItem === "red-key" && objectiveText.status === "get-red-key") {
                objectiveText.lines = ["Access your items","and get your key!"];
                objectiveText.status = "equip-red-key";
            }
            return;
        }

        if(data.value === 16) endWallRight.toggle();
    };

    this.postIntroStart = () => {
        objectiveText.status = "get-red-key";
        objectiveText.text = "Find a red key!";
    };

    world.setTriggerHandlers([[1,()=>endWallLeft.close(),true]]);
}
export default TunnelsOfHell;
