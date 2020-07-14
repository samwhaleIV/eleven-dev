import DeserializeAsync from "./container/deserialize.js";
import Serialize from "./container/serialize.js";
import GetObject from "./objects.js";

function SQContainer(world,isEditor = false) {
    Object.assign(this,{
        world, isEditor, objects: {},
        IDCounter: 0, map: null, decorator: null
    });
}
SQContainer.prototype.getID = function() {
    return this.IDCounter++;
};
SQContainer.prototype.export = function() {
    return Serialize(this);
};
SQContainer.prototype.import = function(data) {
    const deserializePromise = DeserializeAsync(this,data);
    return deserializePromise;
};
SQContainer.prototype.clear = function() {
    for(const ID in this.objects) {
        this.objects[ID].delete();
    }
};
SQContainer.prototype.getObject = function(ID) {
    const object = this.objects[ID];
    return object ? object : null;
};
SQContainer.prototype.getObjects = function() {
    return Object.values(this.objects);
};
SQContainer.prototype.addObject = async function(name,data) {
    const object = GetObject(this,name);
    await object.loadFiles();

    const defaults = JSON.parse(object.self.defaults);
    data = Object.assign(defaults,data ? data : {});
    object.create(data);
};
export default SQContainer;
