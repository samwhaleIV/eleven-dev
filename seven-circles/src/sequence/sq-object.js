import MirrorProperty from "./mirror-property.js";

const {ResourceManager} = Eleven;
const PreviouslyLoadedTypes = {};

function SQObject(container,self,type,overrideID) {
    const {isEditor,world} = container;

    const tileset = isEditor ? world.tileset : world.defaultTileset;

    const parameterHeader = {
        self,container,isEditor,type,
        files: ResourceManager, world, tileset
    };
    Object.assign(this,{
        container,self,type,parameterHeader
    });
    this.ID = !isNaN(overrideID) ? overrideID : container.getID();
    const existingObject = container.objects[this.ID];
    if(existingObject) {
        existingObject.delete();
    }
    container.objects[this.ID] = this;

    this.deletionCallback = null;

    this.watchers = {};
    for(const key in self.properties) {
        MirrorProperty(this.watchers,this,key);
    }
}
SQObject.prototype.loadFiles = async function() {
    if(!this.queueFiles()) return;
    await ResourceManager.load();
};
SQObject.prototype.queueFiles = function() {
    if(this.type in PreviouslyLoadedTypes) {
        return false;
    }

    const {container,self} = this;

    let queuedFiles = false;

    const {thumbnail} = self;

    if(container.isEditor && typeof thumbnail === "string") {
        ResourceManager.queueImage(thumbnail);
        queuedFiles = true;
    }
    if(self.files) {
        ResourceManager.queueManifest(this.self.files);
        queuedFiles = true;
    }

    PreviouslyLoadedTypes[this.type] = true;

    return queuedFiles;
};
SQObject.prototype.create = function(data) {
    const defaults = JSON.parse(this.self.defaults);
    data = Object.assign(defaults,data ? data : {});

    this.self.create(this.parameterHeader,data);
};
SQObject.prototype.delete = function() {
    this.self.delete(this.parameterHeader);
    delete this.container.objects[this.ID];
    if(this.deletionCallback) {
        this.deletionCallback();
    }
};
SQObject.prototype.serialize = function() {
    const data = {};
    for(const property in this.self.properties) {
        data[property] = this.getProperty(property);
    }
    return data;
};
SQObject.prototype.getProperty = function(property) {
    return this.self.properties[property].get(this.parameterHeader);
};
SQObject.prototype.setProperty = function(property,value) {
    this.self.properties[property].set(this.parameterHeader,value);
    this.watchers[property].fire(value);
};
SQObject.prototype.hasProperty = function(property) {
    return property in this.self.properties;
};
SQObject.prototype.getSize = function() {
    let width, height;
    if(this.hasProperty("width")) {
        width = this.width;
    } else {
        width = this.self.width;
    }
    if(this.hasProperty("height")) {
        height = this.height;
    } else {
        height = this.self.height;
    }
    return {width,height};
};
SQObject.prototype.addPropertyWatcher = function(property,handler) {
    return this.watchers[property].add(handler);
};
SQObject.prototype.removePropertyWatcher = function(property,ID) {
    this.watchers[property].remove(ID);
};
SQObject.prototype.getProperties = function() {
    return Object.entries(this.self.properties);
};
export default SQObject;
