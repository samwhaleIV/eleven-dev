import {
    KeyDoor,
    PickupField,
    AddColorBackground,
    SpriteDoor,
    ObjectiveText,
    AddFixedWaterBackground,
    MessageChain,
    DramaZoom,
    GetTransitionTrigger,
    SaveStone
} from "../helper.js";

const nextMap = "ChocolateHell";

function TunnelsOfHell({world,lastScript,inventory,saveState}) {

    const fromNextMap = lastScript === nextMap;

    world.setMap("tunnels-of-hell");
    AddColorBackground(world,"black");

    AddFixedWaterBackground(world,81,7,5,5,{
        width: 1,height: 1,y: 10.5,x: 83
    });

    const player = world.addPlayer();

    if(fromNextMap) {
        player.setPosition(83,6);
        player.direction = "up";
    } else {
        player.setPosition(4,3.5);
        player.direction = "down";
    }

    const saveStone = new SaveStone(world,68,8);

    this.unload = () => {
        inventory.clear("red-key");
        inventory.clear("green-key");
        inventory.clear("pink-key");
        inventory.clear("blue-key");
        inventory.clear("yellow-key");
    };
    this.unload();

    const doors = KeyDoor.getDoors(world,this,[
        [8,14,"verticalRed"],
        [6,8,"verticalYellow"],
        [25,13,"verticalBlue"],
        [20,2,"horizontalGreen"],
        [48,6,"horizontalGreen"],
        [37,5,"horizontalYellow"],
        [52,8,"verticalPink"]
    ]);

    const pickupField = new PickupField(world,[
        [4,15,"red-key"],
        [8,9,"green-key"],
        [21,1,"pink-key"],
        [30,3,"blue-key"],
        [49,13,"yellow-key"]
    ]);

    const endWallLeft = new SpriteDoor(world,57,8,"grayDoor",player.x < 55,2000,48);
    const endWallRight = new SpriteDoor(
        world,71,8,"grayDoor",saveState.get("talkedToDemonGuy")?true:false,2000,49
    );

    const objective = new ObjectiveText(world);

    this.keyDoorOpened = door => {
        if(objective.status === "open-red-door" && door.color === "red") {
            objective.close();
        }
    };

    player.watchWeaponChange(weapon=>{
        if(weapon && objective.status === "equip-red-key" &&
           weapon.name === "key-weapon" && weapon.color === "red"
        ) {
            objective.set("Open the red door!","open-red-door");
        }
    });

    const lockDoorInteraction = door => {
        if(door.opened) return;
        world.message("The door is closed!");
    };

    this.interact = data => {
        if(saveStone.tryInteract(data)) return;

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

        if(data.value === 16) {
            if(saveState.get("talkedToDevilGuy")) {
                world.say("You can go now. I don't need the company.");
                return;
            }

            world.playerController.lock();
            saveState.set("talkedToDevilGuy",true);

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
                await world.say("You're free to go now. I have to go hat shopping. Hell has been a bit drafty lately.");
    
                world.playerController.unlock();
                endWallRight.open();
            })();
        }
    };

    this.start = () => {
        if(!fromNextMap) {
            objective.set("Find the red key!","get-red-key");
        }
        return false;
    };

    world.setTriggers([
        [1,()=>{
            world.say("Hey! Get over here!");
            endWallLeft.close();
        },true],
        GetTransitionTrigger(world,2,nextMap)
    ]);
}
export default TunnelsOfHell;
