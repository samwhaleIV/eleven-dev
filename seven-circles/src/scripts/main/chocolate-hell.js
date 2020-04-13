import KeyDoor from "../helper/doors/key-door.js";
import PickupField from "../helper/pickup-field.js";
import PickupRock from "../../weapons/pickup-rock.js";
import SpriteDoor from "../helper/doors/sprite-door.js";
import AddMilkBackground from "../helper/backgrounds/milk-background.js";
import PanPreview from "../helper/pan-preview.js";
import FadeTransition from "../helper/fade-transition.js";

const WATER_ROCK_SPOT_ID = 32;
const PICKUP_ROCK_ID = 48;
const ROCK_FOREGROUND_ID = 533;

const NO_MILK_SKELE = 783;
const MILK_SKELE = 847;

const SKELE_ID = 16;

const END_DOOR = [39,27];

function ChocolateHell({world,source,inventory}){

    world.setMap("chocolate-hell");

    world.camera.enablePadding();
    AddMilkBackground(world);

    const {tileRenderer} = world;

    const player = world.addPlayer();

    switch(source) {
        default:
            player.setPosition(20,4);
            player.direction = "down";
            break;
        case "TBD":
            player.setPosition(20,4);
            player.direction = "down";
            break;
    }

    const waterPlacements = {};
    const pickupRockLocations = {};

    tileRenderer.readLayer(4).forEach((value,idx)=>{
        if(value === WATER_ROCK_SPOT_ID) {
            const [x,y] = tileRenderer.getXY(idx);
            waterPlacements[`${x},${y}`] = true;
            world.setCollisionTile(x,y,1);
        } else if(value === PICKUP_ROCK_ID) {
            const [x,y] = tileRenderer.getXY(idx);
            pickupRockLocations[`${x},${y}`] = true;
            world.setCollisionTile(x,y,1);
        }
    });

    const badRock = () => {
        world.message("A rock can't go here!");
    };

    this.placeRock = () => {
        const result = world.playerImpulse.impulse({tileHandler:data=>{
            const {x,y,value} = data;
            if(value === WATER_ROCK_SPOT_ID) {
                player.unlockWeapon(); player.clearWeapon();
                world.setCollisionTile(x,y,0);
                world.setForegroundTile(x,y,ROCK_FOREGROUND_ID);
                world.setInteractionTile(x,y,0);
                world.pushTileChanges();
                return true;    
            }
            return false;
        }});
        if(!result) badRock();
    };

    this.endDoor = new SpriteDoor(world,END_DOOR[0],END_DOOR[1],"grayDoor",false,1000,39);

    const doors = KeyDoor.getDoors(world,[
        [35,8,"horizontalChocolate"]
    ]);
    this.useKey = doors.useKey;

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
            world.message("The door won't open until all the skele-demons get their chocolate milk..");
        })) return;
        if(data.value === PICKUP_ROCK_ID) {
            const {x,y} = data;
            const pos = `${x},${y}`;
            delete pickupRockLocations[pos];

            world.setForegroundTile(x,y,0);
            world.setCollisionTile(x,y,0);
            world.setInteractionTile(x,y,0);
            world.pushTileChanges();

            player.setWeapon(PickupRock,this);
            player.lockWeapon();
            return;
        } else if(data.value === SKELE_ID) {
            const playerWep = player.getWeapon();
            if(playerWep && playerWep.name === "rock-pickup") {
                world.say("That isn't chocolate milk.. That's a rock.");
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
        [1,()=>{FadeTransition(world,"TunnelsOfHell")},true]
    ]);
}
export default ChocolateHell;
