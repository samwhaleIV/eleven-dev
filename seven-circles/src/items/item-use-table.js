import Pickup from "./scripts/pickup.js";
import Present from "./scripts/present.js";
import {BigPill,SmallPill} from "./scripts/alice-pills.js";
import Blaster from "./scripts/blaster.js";
import Key from "./scripts/key.js";
import Bomb from "./scripts/bomb.js";
import SpeedPill from "./scripts/speed-pill.js";

function ImpulsePassthrough() {
    this.retain = true;
    this.action = ({world}) => {
        if(world.playerController && world.playerController.locked) {
            world.playerController.unlock();
        }
        return world.playerImpulse.impulse();
    };
}

const ItemUseTable = {
    "elf-rock": [Pickup,27,"elf-rock"],
    "rock": [Pickup,28,"rock"],
    "sink": [Pickup,29,"sink"],
    "present": [Present,30],
    "big-pill": BigPill,
    "small-pill": SmallPill,
    "blaster": Blaster,
    "red-key": [Key,"red"],
    "blue-key": [Key,"blue"],
    "yellow-key": [Key,"yellow"],
    "green-key": [Key,"green"],
    "pink-key": [Key,"pink"],
    "chocolate-key": [Key,"chocolate"],
    "bomb": Bomb,
    "speed-pill": SpeedPill,

    /* Impulse passthroughs... */
    "chocolate-milk": ImpulsePassthrough,
    "warp-crystal": ImpulsePassthrough,
    "power-cell": ImpulsePassthrough,
    "blueprint-fragment": ImpulsePassthrough
};

Object.entries(ItemUseTable).forEach(([key,values])=>{
    let useObject;
    if(Array.isArray(values)) {
        const sourceObject = values.shift();
        useObject = new sourceObject(...values);
    } else {
        useObject = new values();
    }
    ItemUseTable[key] = useObject;
});

Object.freeze(ItemUseTable);

export default ItemUseTable;
