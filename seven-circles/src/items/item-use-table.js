import Pickup from "./scripts/pickup.js";
import Present from "./scripts/present.js";
import {BigPill,SmallPill} from "./scripts/alice-pills.js";
import Blaster from "./scripts/blaster.js";
import Key from "./scripts/key.js";
import Bomb from "./scripts/bomb.js";

const ItemUseTable = Object.freeze({
    "elf-rock": new Pickup(27,"elf-rock"),
    "rock": new Pickup(28,"rock"),
    "sink": new Pickup(29,"sink"),
    "present": new Present(30),
    "big-pill": new BigPill(),
    "small-pill": new SmallPill(),
    "blaster": new Blaster(),
    "red-key": new Key("red"),
    "blue-key": new Key("blue"),
    "yellow-key": new Key("yellow"),
    "green-key": new Key("green"),
    "pink-key": new Key("pink"),
    "chocolate-key": new Key("chocolate"),
    "bomb": new Bomb()
});

export default ItemUseTable;
