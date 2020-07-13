const {ResourceManager} = Eleven;

async function Deserialize(container,data) {
    const {objects} = data;
    const newObjects = [];

    for(const {type,data} of objects) {
        const object = container.getObject(type);
        newObjects.push({object,data});

        object.queueFiles();
    }
    await ResourceManager.load();
    for(const {object,data} of newObjects) {
        object.create(data);
    }
}
export default Deserialize;
