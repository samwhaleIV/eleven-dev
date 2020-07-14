const {ResourceManager} = Eleven;
const previouslyLoadedTypes = {};

function SQObject(container,self,type) {
    const {isEditor,world} = container;
    const parameterHeader = {
        self,container,isEditor,type,
        files: ResourceManager, world
    };
    Object.assign(this,{
        container,self,type,parameterHeader
    });
    this.ID = container.getID();
    container.objects[this.ID] = this;
}

SQObject.prototype.canLoadFiles = function() {
    if(!self.files || type in previouslyLoadedTypes) return;
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
    delete this.container[this.ID];
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
