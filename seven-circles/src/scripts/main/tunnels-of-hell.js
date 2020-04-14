import KeyDoor from "../helper/doors/key-door.js";
import PickupField from "../helper/pickup-field.js";
import AddColorBackground from "../helper/color-background.js";
import SpriteDoor from "../helper/doors/sprite-door.js";
import ObjectiveText from "../helper/objective-text.js";
import KeyWeapon from "../../weapons/key-weapon.js";
import {AddFixedMilkBackground} from "../helper/backgrounds/milk-background.js";
import MessageChain from "../helper/message-chain.js";
import DramaZoom from "../helper/drama-zoom.js";

function TunnelsOfHell({world,lastScript,inventory,saveState,transition}) {

    const fromChocolateHell = lastScript === "ChocolateHell";

    world.setMap("tunnels-of-hell");
    AddColorBackground(world,`rgb(20,0,0)`);

    AddFixedMilkBackground(world,81,7,5,5,{
        width: 1,height: 1,y: 10.5,x: 83
    });

    const player = world.addPlayer();

    if(fromChocolateHell) {
        player.setPosition(83,6);
        player.direction = "up";
    } else {
        player.setPosition(4,3.5);
        player.direction = "down";
    }

    this.unload = () => {
        inventory.clearItem("red-key");
        inventory.clearItem("green-key");
        inventory.clearItem("pink-key");
        inventory.clearItem("blue-key");
        inventory.clearItem("yellow-key");
    };
    this.unload();

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

    const endWallLeftStartOpen = fromChocolateHell ? false : true;
    const endWallRightStartOpen = fromChocolateHell ? true : false;

    const endWallLeft = new SpriteDoor(world,57,8,"grayDoor",endWallLeftStartOpen,2000,48);
    const endWallRight = new SpriteDoor(world,71,8,"grayDoor",endWallRightStartOpen,2000,49);

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

        if(!saveState.get("talkedToDevilGuy") && data.value === 16) {
            saveState.set("talkedToDevilGuy",true);
    
            world.playerController.lock();
            (async () => {
                const dramaZoom = new DramaZoom(world,64,8);
                await dramaZoom.zoomIn();

                await MessageChain(world,[
                    "Look, I don't have a lot of time so I'll make this brief. You're dead.",
                    "You probably have a lot of questions but we don't have time for them.",
                    "There's all this red tape and it makes my life a living hell. They don't make dying like they used to..",
                    "So here's the short version: You have a strong soul. If you can make it through each of the Seven Circles, you get to live."
                ]);

                await dramaZoom.zoomOut();
                await world.sayUnlocked("You're free to go now. I have to go hat shopping. Hell has been a bit drafty lately.");
    
                world.playerController.unlock();
                endWallRight.open();
            })();
        }
    };

    this.start = () => {
        if(fromChocolateHell) return;
        objective.set("Find the red key!","get-red-key");
    };

    world.setTriggerHandlers([
        [1,()=>{
            world.say("Hey! Get over here!");
            endWallLeft.close();
        },true],
        [2,()=>{transition("ChocolateHell")},true]
    ]);
}
export default TunnelsOfHell;
