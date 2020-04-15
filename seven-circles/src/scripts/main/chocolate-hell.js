import KeyDoor from "../helper/doors/key-door.js";
import PickupField from "../helper/pickup-field.js";
import SpriteDoor from "../helper/doors/sprite-door.js";
import AddMilkBackground from "../helper/backgrounds/milk-background.js";
import PanPreview from "../helper/pan-preview.js";
import RiverRocks from "../helper/river-rocks.js";

const NO_MILK_SKELE = 783;
const MILK_SKELE = 847;
const SKELE_ID = 16;
const END_DOOR = [39,27];

function ChocolateHell({world,lastScript,inventory,transition}){

    world.setMap("chocolate-hell");
    world.camera.enablePadding();
    AddMilkBackground(world);

    const player = world.addPlayer();

    switch(lastScript) {
        default:
            player.setPosition(20,4);
            player.direction = "down";
            break;
        case "RiverHell":
            player.setPosition(20,4);
            player.direction = "down";
            break;
    }

    const riverRocks = new RiverRocks(world,this);

    this.endDoor = new SpriteDoor(
        world,END_DOOR[0],END_DOOR[1],"grayDoor",false,1000,39
    );

    const doors = KeyDoor.getDoors(world,this,[
        [35,8,"horizontalChocolate"]
    ]);

    this.unload = () => {
        inventory.clearItem("chocolate-key");
        inventory.clearItem("chocolate-milk");
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

    this.interact = data => {
        if(doors.tryInteract(data)) return;
        if(pickupField.tryPickup(data)) return;
        if(this.endDoor.tryInteract(data,door => {
            if(door.opened) return;
            world.message("The door won't open until all the skele-demons get their chocolate milk.");
        })) return;

        if(riverRocks.tryPickup(data)) return;
        
        if(data.value === SKELE_ID) {
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
                    if(inventory.hasItem("chocolate-milk")) {
                        await world.sayUnlocked("I waited a long time for this moment.");
                        await frameDelay(500);
                        inventory.removeItem("chocolate-milk");
                        world.setForegroundTile(x,y,MILK_SKELE);
                        milkGaveCount++;
                        await frameDelay(500);
                        await world.sayUnlocked("Chocolate.. Mmmmmm.");
                        await frameDelay(250);
                        if(milkGaveCount === 4) await PanPreview({
                            world,x: 39,y: 28,delay: 2500,
                            middleEvent: async () => {
                                await frameDelay(500);
                                this.endDoor.open();
                            }
                        });
                    } else {
                        await world.sayUnlocked("Need. Chocolate. Milk.");
                    }
                } else if(foregroundValue === MILK_SKELE) {
                    await world.sayUnlocked("Mmmm.. Delicious chocolate milk.");
                }
                world.playerController.unlock();
            })();
        }
    };

    world.setTriggerHandlers([
        [1,()=>{transition("TunnelsOfHell")},true],
        [2,()=>{transition("RiverHell")},true]
    ]);
}
export default ChocolateHell;
