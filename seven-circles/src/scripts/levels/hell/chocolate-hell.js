import {
    KeyDoor,
    PickupField,
    SpriteDoor,
    AddWaterBackground,
    PanPreview,
    RiverRocks,
    ObjectiveText,
    InstallLevelChainTriggers
} from "../helper.js";

const NO_MILK_SKELE = 783;
const MILK_SKELE = 847;
const SKELE_ID = 16;
const END_DOOR = [39,27];

const DELIVERY_COUNT = 4;

function ChocolateHell({
    world,inventory,fromNextMap
}){
    world.setMap("chocolate-hell");
    world.camera.enablePadding();
    AddWaterBackground(world);

    const player = world.addPlayer();

    if(fromNextMap) {
        player.setPosition(45,29);
        player.direction = "up";
    } else {
        player.setPosition(20,4);
        player.direction = "down";
    }

    const riverRocks = new RiverRocks(world,this);

    this.endDoor = new SpriteDoor(
        world,END_DOOR[0],END_DOOR[1],"grayDoor",false,1000,39
    );

    const doors = KeyDoor.getDoors(world,this,[
        [35,8,"horizontalChocolate"]
    ]);

    this.unload = () => {
        inventory.clear("chocolate-key");
        inventory.clear("chocolate-milk");
    };
    this.unload();

    const pickupField = new PickupField(world,[
        [14,15,"chocolate-key"],
        [33,4,"chocolate-milk",1,true,false],
        [35,3,"chocolate-milk",2,true,false],
        [36,3,"chocolate-milk",1,true,false],
        [37,5,"chocolate-milk",1,true,false]
    ]);

    let milkGaveCount = 0;
    const objective = new ObjectiveText(world);

    const getDeliveryStatusMessage = () => {
        return `Deliver milk to skeledemons!|(${milkGaveCount}/${DELIVERY_COUNT})`;
    };

    this.interact = data => {
        if(doors.tryInteract(data)) return;

        const pickedUpItem = pickupField.tryPickup(data);
        if(pickedUpItem) {
            if(objective.status === "collect-milk" && pickedUpItem === "chocolate-milk") {
                objective.set(getDeliveryStatusMessage(),"delivery");
            }
        }

        if(this.endDoor.tryInteract(data,door => {
            if(door.opened) return;
            if(!fromNextMap) {
                world.message("The door won't open until all the skeledemons get their chocolate milk.");
            } else {
                world.message("The door is taking a nap.");
            }
        })) return;

        if(riverRocks.tryPickup(data)) return;
        
        if(data.value === 17) {
            world.sayNamed("This looks like a fun one kiddo.","Mysterious Lamp","r");
        } else if(data.value === SKELE_ID) {
            const playerWep = player.getWeapon();
            if(playerWep && playerWep.name === "rock-pickup") {
                world.say("That isn't chocolate milk. That's a rock.");
                return;
            }
            const {x,y} = data;
            const foregroundValue = world.getForegroundTile(x,y);
            world.playerController.lock();
            (async () => {
                if(foregroundValue === NO_MILK_SKELE) {
                    if(inventory.has("chocolate-milk")) {
                        await world.say("I waited a long time for this moment.");
                        await frameDelay(500);
                        inventory.take("chocolate-milk");
                        world.setForegroundTile(x,y,MILK_SKELE);
                        milkGaveCount++;
                        objective.set(getDeliveryStatusMessage());
                        await frameDelay(500);
                        await world.say("Chocolate.. Mmmmmm.");
                        await frameDelay(250);
                        if(milkGaveCount === 4) {
                            if(objective.status === "delivery") {
                                objective.close();
                            }
                            await PanPreview({
                                world,x: 39,y: 28,
                                middleEvent: async () => {
                                    await frameDelay(500);
                                    this.endDoor.open();
                                }
                            });
                        }
                    } else {
                        await world.say("Need. Chocolate. Milk.");
                    }
                } else if(foregroundValue === MILK_SKELE) {
                    await world.say("Mmmm.. Delicious chocolate milk.");
                }
                world.playerController.unlock();
            })();
        }
    };

    InstallLevelChainTriggers(world);

    this.keyDoorOpened = door => {
        if(objective.status === "find-stash" && door.color === "chocolate") {
            objective.set("Collect chocolate milk!","collect-milk");
        }
    };
    this.start = () => {
        if(!fromNextMap) {
            objective.set("Locate chocolate milk stash!","find-stash");
        }
        return false;
    };
}
export default ChocolateHell;
