import SQObject from "./sq-object.js";
import Objects from "./objects/object-manifest.js";
import Placeholder from "./objects/types/placeholder.js";
const FallbackType = Placeholder;

const GetObject = (container,type,overrideID) => {
    let baseObject = Objects[type];
    if(!baseObject) {
        console.warn(`Object type '${type}' not found!`);
        baseObject = FallbackType;
    }
    const dataContainer = Object.assign({},baseObject);
    return new SQObject(
        container,dataContainer,type,overrideID
    );
};
export default GetObject;
export {GetObject, Objects};
