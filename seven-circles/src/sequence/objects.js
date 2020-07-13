import SQObject from "./sq-object.js";
import Player from "./objects/player.js";
import Placeholder from "./objects/placeholder.js";
const FallbackType = Placeholder;

const objects = {Player,Placeholder};

const GetObject = (container,name) => {
    let baseObject = objects[name];
    if(!baseObject) {
        console.warn(`Object type '${name}' not found!`);
        baseObject = FallbackType;
    }
    const dataContainer = Object.assign({},baseObject);
    return new SQObject(container,dataContainer,name);
};
export default GetObject;
