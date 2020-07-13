const {ResourceManager} = Eleven;
const previouslyLoadedObjects = {};

function SQObject(container,self,name) {
    const {isEditor,world} = container;
    const parameterHeader = {
        self,container,isEditor,name,
        files: ResourceManager, world
    };
    Object.assign(this,{container,self,name,parameterHeader});
    const ID = container.getID();
    container[ID] = this;
    this.ID = ID;
}

SQObject.prototype.canLoadFiles = function() {
    if(!self.files || name in previouslyLoadedObjects) return;
};
SQObject.prototype.loadFiles = async function() {
    if(!this.canLoadFiles()) return;

    await ResourceManager.queueManifest(this.self.files).load();
    previouslyLoadedObjects[this.name] = true;
};
SQObject.prototype.queueFiles = function() {
    if(!this.canLoadFiles()) return;

    ResourceManager.queueManifest(this.self.files);
    previouslyLoadedObjects[this.name] = true;
};
SQObject.prototype.create = function(data) {
    this.self.create(this.parameterHeader,data);
};
SQObject.prototype.delete = function() {
    this.self.delete(this.parameterHeader);
    delete this.container[this.ID];
};
SQObject.prototype.serialize = function() {
    this.self.save(this.parameterHeader);
};
SQObject.prototype.getProperty = function(property) {
    return this.self.properties[property].get(this.parameterHeader);
};
SQObject.prototype.setProperty = function(property,value) {
    this.self.properties[property].set(this.parameterHeader,value);
};
export default SQObject;
