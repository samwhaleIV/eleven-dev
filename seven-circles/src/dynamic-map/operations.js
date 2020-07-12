import ColorFill from "./operations/color-fill.js";
import Outline from "./operations/outline.js";
import PatternFill from "./operations/pattern-fill.js";
import AddPattern from "./operations/add-pattern.js";
import CollisionMap from "./operations/collision-map.js";
import ShadowOutline from "./operations/shadow-outline.js";

const Operations = {
    "Color": ColorFill,
    "Outline": Outline,
    "AddPattern": AddPattern,
    "Pattern": PatternFill,
    "CollisionMap": CollisionMap,
    "Shadow": ShadowOutline
};

export default Operations;
