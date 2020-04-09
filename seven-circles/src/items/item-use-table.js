import Pickup from "./scripts/pickup.js";
import Present from "./scripts/present.js";
import {BigPill,SmallPill} from "./scripts/alice-pills.js";
import Blaster from "./scripts/blaster.js";

const ItemUseTable = Object.freeze({
    "elf-rock": new Pickup(27,"elf-rock"),
    "rock": new Pickup(28,"rock"),
    "sink": new Pickup(29,"sink"),
    "present": new Present(30),
    "big-pill": new BigPill(),
    "small-pill": new SmallPill(),
    "blaster": new Blaster()
});

export default ItemUseTable;
