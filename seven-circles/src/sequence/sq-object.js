const {ResourceManager} = Eleven;
const previouslyLoadedTypes = {};

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

    for(const key in self.properties) {
        Object.defineProperty(this,key,{
            get: () => this.getProperty(key),
            set: value => this.setProperty(key,value),
            enumerable: true
        });
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
    this.self.create(this.parameterHeader,data);
};
SQObject.prototype.delete = function() {
    this.self.delete(this.parameterHeader);
    delete this.container.objects[this.ID];
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
};
export default SQObject;
