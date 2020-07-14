import GetObject from "../objects.js";
const {ResourceManager} = Eleven;

async function DeserializeAsync(container,data) {
    const {map,decorator,objects} = data;
    Object.assign(container,{map,decorator});

    const newObjects = [];

    for(const {type,data} of objects) {
        const object = GetObject(container,type);
        newObjects.push({object,data});

        object.queueFiles();
    }
    await ResourceManager.load();
    for(const {object,data} of newObjects) {
        object.create(data);
    }
}
export default DeserializeAsync;
