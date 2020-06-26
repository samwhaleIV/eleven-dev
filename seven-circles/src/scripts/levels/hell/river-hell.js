import {
    AddWaterBackground,
    KeyDoor,
    PickupField,
    RiverRocks,
    InstallBombAreas,
    MessageChain,
    ObjectiveText,
    InstallLevelChainTriggers
} from "../helper.js";

function RiverHell({world,inventory,fromNextMap}) {
    world.setMap("river-hell");
    world.camera.padding = true;
    AddWaterBackground(world);

    const objective = new ObjectiveText(world);

    const player = world.addPlayer();
    if(fromNextMap) {
        player.setPosition(6,80);
        player.direction = "up";
    } else {
        player.setPosition(7,3);
        player.direction = "down";
    }

    const doors = KeyDoor.getDoors(world,this,[
        [24,5,"verticalRed"],
        [24,78,"verticalYellow"]
    ]);

    const riverRocks = new RiverRocks(world,this);

    const pickupField = new PickupField(world,[
        [5,2,"bomb"],
        [9,5,"bomb"],
        [7,52,"bomb"],
        [9,54,"bomb"],
        [4,64,"red-key"],
        [26,6,"yellow-key"],
        [30,4,"speed-pill"]
    ]);

    InstallBombAreas(world,this);

    this.unload = () => {
        inventory.clear("bomb");
        inventory.clear("red-key");
        inventory.clear("yellow-key");
        inventory.clear("speed-pill");
    };
    this.unload();

    let gotLastBomb = false;

    this.interact = data => {
        if(doors.tryInteract(data)) return;
        if(pickupField.tryPickup(data)) return;
        if(riverRocks.tryPickup(data)) return;

        if(data.value === 18) {
            (async () => {
                await MessageChain(world,[
                    "Explosions. Death. Fire. Pain.",
                    "Sorry, I was just thinking out loud.",
                    "There might be a faster way to get through this chamber.",
                ],["Mysterious Lamp","r"]);
            })();
        } else if(data.value === 16) {
            if(gotLastBomb) {
                world.say("You saved my friends! You're a saint!");
            } else {
                world.say("Help! I lost my key in the mud! My friends are trapped on the other end of the river!");
            }
        } else if(data.value === 17) {
            if(gotLastBomb) {
                world.say("Thanks again for the help!");
                return;
            }
            (async ()=>{
                await MessageChain(world,[
                    "Freedom! Thank you kind soul!",
                    "Take this as a token of our gratitude."
                ],true);
                if(objective.status === "freedom") objective.close();
                inventory.give("bomb",1);
                gotLastBomb = true;
            })();
        }
    };

    this.start = () => {
        if(!fromNextMap) {
            objective.set("Free the trapped skeledemons!","freedom");
        }
        return false;
    };

    InstallLevelChainTriggers(world);
}
export default RiverHell;
