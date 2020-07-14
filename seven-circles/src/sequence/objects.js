import SQObject from "./sq-object.js";
import Player from "./objects/player.js";
import Placeholder from "./objects/placeholder.js";
const FallbackType = Placeholder;

const objects = {Player,Placeholder};

const GetObject = (container,type) => {
    let baseObject = objects[type];
    if(!baseObject) {
        console.warn(`Object type '${type}' not found!`);
        baseObject = FallbackType;
    }
    const dataContainer = Object.assign({},baseObject);
    return new SQObject(container,dataContainer,type);
};
export default GetObject;
