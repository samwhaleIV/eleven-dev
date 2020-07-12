import {ColorIDs} from "./colors.js";

function DecoratorBuffer(template) {
    this.template = template;
    this.changes = new Object();
    this.colorTable = new Object();
    this.colorID = ColorIDs.Yellow + 1;
    this.patterns = new Object();
    this.tileCollision = null;
}
const hexToRGB = color => {
    /* Modified from https://stackoverflow.com/a/11508164 */
    const int = parseInt(color.slice(1),16);
    const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
    return [r,g,b,255];
};
DecoratorBuffer.prototype.hexToRGB = hexToRGB;
DecoratorBuffer.prototype.addColor = function(color) {
    if(typeof color === "string") color = hexToRGB(color);
    const ID = this.colorID++;
    this.colorTable[ID] = color;
    return ID;
};
DecoratorBuffer.prototype.getMap = function() {
    const {template,changes} = this;
    const map = template.clone();
    const changeList = Object.entries(changes);
    for(const [idx,value] of changeList) {
        map[idx] = value;
    }
    return map;
};
DecoratorBuffer.prototype.get = function(x,y) {
    return this.template.get(x,y);
};
DecoratorBuffer.prototype.getMask = function(x,y) {
    const idx = this.template.getIdx(x,y);
    if(idx in this.changes) return this.changes[idx];
    return this.template.get(x,y);
};
DecoratorBuffer.prototype.set = function(x,y,value) {
    const {template} = this;
    if(!template.inRange(x,y)) return;
    const idx = template.getIdx(x,y);
    this.changes[idx] = value;
};
DecoratorBuffer.prototype.clear = function() {
    this.changes = new Object();
};
export default DecoratorBuffer;
