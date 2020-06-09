import {
    AddWaterBackground,
    KeyDoor,
    PickupField,
    RiverRocks,
    InstallBombAreas,
    MessageChain,
    ObjectiveText,
    GetTransitionTrigger
} from "../helper.js";

function RiverHell({world,lastScript,inventory,lastMap,nextMap}) {
    world.setMap("river-hell");
    world.camera.padding = true;
    AddWaterBackground(world);

    const objective = new ObjectiveText(world);

    const player = world.addPlayer();
    if(lastScript === nextMap) {
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
    };
    this.unload();

    this.interact = data => {
        if(doors.tryInteract(data)) return;
        if(pickupField.tryPickup(data)) return;
        if(riverRocks.tryPickup(data)) return;

        if(data.value === 16) {
            world.say("Can you save my friends? They got trapped on the other side of the river!");
        } else if(data.value === 17) {
            (async ()=>{
                await MessageChain(world,[
                    "Freedom! Thank you kind soul!",
                    "Take this, it might be useful to you if you know how to use it."
                ],true);
                if(objective.status === "freedom") objective.close();
                inventory.give("bomb",1);
            })();
        }
    };

    this.start = () => {
        if(lastScript !== nextMap) {
            objective.set("Free the trapped skeledemons!","freedom");
        }
        return false;
    };

    world.setTriggers([
        GetTransitionTrigger(world,1,lastMap),
        GetTransitionTrigger(world,2,nextMap)
    ]);
}
export default RiverHell;
