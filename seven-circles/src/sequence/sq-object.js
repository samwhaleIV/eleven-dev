const {ResourceManager} = Eleven;
const previouslyLoadedTypes = {};

const DefineProperty = (target,key) => {
    target.propertyWatchers[key] = {
        counter: 0, handlers: {}, list: []
    };
    Object.defineProperty(target,key,{
        get: () => target.getProperty(key),
        set: value => target.setProperty(key,value),
        enumerable: true
    });
};
function SQObject(container,self,type,overrideID) {
    const {isEditor,world} = container;
    const parameterHeader = {
        self,container,isEditor,type,
        files: ResourceManager, world
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

    this.onDelete = null;

    this.propertyWatchers = {};
    for(const key in self.properties) {
        DefineProperty(this,key);
    }
}

SQObject.prototype.canLoadFiles = function() {
    return this.self.files && !(this.type in previouslyLoadedTypes);
};
SQObject.prototype.loadFiles = async function() {
    if(!this.canLoadFiles()) return;

    await ResourceManager.queueManifest(this.self.files).load();
    previouslyLoadedTypes[this.type] = true;
};
SQObject.prototype.queueFiles = function() {
    if(!this.canLoadFiles()) return;

    ResourceManager.queueManifest(this.self.files);
    previouslyLoadedTypes[this.type] = true;
};
SQObject.prototype.create = function(data) {
    const defaults = JSON.parse(this.self.defaults);
    data = Object.assign(defaults,data ? data : {});

    this.self.create(this.parameterHeader,data);
};
SQObject.prototype.delete = function() {
    this.self.delete(this.parameterHeader);
    delete this.container.objects[this.ID];
    if(this.onDelete) this.onDelete();
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

    const watcherList = this.propertyWatchers[property].list
    for(const handler of watcherList) handler(value);
};
SQObject.prototype.watchProperty = function(property,handler) {
    const wathcherSet = this.propertyWatchers[property];

    const ID = wathcherSet.counter + 1;
    wathcherSet.counter = ID;

    wathcherSet.handlers[ID] = handler;
    wathcherSet.list = Object.values(wathcherSet.handlers);

    return ID;
};
SQObject.prototype.unwatchProperty = function(property,ID) {
    const wathcherSet = this.propertyWatchers[property];

    delete wathcherSet.handlers[ID];
    wathcherSet.list = Object.values(wathcherSet.handlers);
};
SQObject.prototype.getProperties = function() {
    return Object.entries(this.self.properties);
};
export default SQObject;
