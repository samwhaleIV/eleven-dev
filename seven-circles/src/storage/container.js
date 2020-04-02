import SerializeHelper from "./serialize-helper.js"; 

function AddValues(container,values) {
    delete values[SerializeHelper.DeserializeFlag];
    Object.assign(container.data,values);
}
function TryAddValues(container,values) {
    if(values) AddValues(container,values);
}
function ClearContainer(container) {
    const {data} = container;
    Object.keys(data).forEach(key => delete data[key]);
}

function Container(values) {
    this[SerializeHelper.Symbol] = true;
    this.data = new Object();
    TryAddValues(this,values);
    Object.freeze(this);
}
Container.prototype.serialize = function() {
    const target = new Object();
    Object.assign(target,this.data);
    target[SerializeHelper.DeserializeFlag] = true;
    return target;
}
Container.prototype.set = function(key,value) {
    this.data[key] = value; return value;
}
Container.prototype.get = function(key) {
    let value = this.data[key];
    if(value === undefined) return null;
    return value;
}
Container.prototype.has = function(key) {
    return key in this.data;
}
Container.prototype.delete = function(key) {
    return delete this.data[key];
}
Container.prototype.restore = function(defaults) {
    ClearContainer(this); TryAddValues(this,defaults);
}

export default Container;
