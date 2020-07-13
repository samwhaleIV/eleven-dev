import Deserialize from "./container/deserialize.js";
import Serialize from "./container/serialize.js";
import GetObject from "./objects.js";

const orNull = value => value ? value : null;

function SQContainer(world,isEditor) {
    this.world = world;
    this.objects = new Object();
    this.isEditor = Boolean(isEditor);
    this.IDCounter = 0;
}
SQContainer.prototype.getID = function() {
    const ID = this.IDCounter;
    this.IDCounter += 1;
    return ID;
};
SQContainer.prototype.export = function() {
    return Serialize(this);
};
SQContainer.prototype.import = async function(data) {
    this.map = orNull(data.map);
    this.decorator = orNull(data.decorator);
    await Deserialize(this,data);
};
SQContainer.prototype.clear = function() {
    for(const object of Object.values(this.objects)) {
        object.delete();
    }
};
SQContainer.prototype.setMap = function() {
    throw Error("Not implemented. This is for the editor.");
};
SQContainer.prototype.setDecorator = function() {
    throw Error("Not implemented. This is for the editor.");
};
SQContainer.prototype.getObject = function(name) {
    return GetObject(this,name);
};
SQContainer.prototype.addObject = async function(name) {
    const object = this.getObject(name);
    await object.loadFiles();
};
export default SQContainer;
