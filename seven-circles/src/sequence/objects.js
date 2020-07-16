import SQObject from "./sq-object.js";
import Objects from "./objects/object-manifest.js";
import Placeholder from "./objects/types/placeholder.js";
const FallbackType = Placeholder;

const ObjectPriority = (()=>{
    const objectsList = Objects.keys(Objects);
    const table = new Object();
    for(let i = 0;i<objectsList.length;i++) {
        table[objectsList[i]] = i;
    }
    Object.freeze(table);
    return table;
});

const ObjectSorter = (a,b) => {
    a = ObjectPriority[a.type], b = ObjectPriority[b.type];
    return a - b;
};

const SortObjects = objectsList => {
    objectsList.sort(ObjectSorter);
    return objectsList;
};

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
export {GetObject,Objects,SortObjects};
