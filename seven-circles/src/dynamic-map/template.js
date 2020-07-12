import GetImageMap from "./image-map.js";
import {ColorIDs} from "./colors.js";

function Template(image,renderMargin) {
    const imageMap = GetImageMap(image,renderMargin);
    Object.freeze(Object.assign(this,imageMap));
}
Template.prototype.getXY = function(idx) {
    const {width} = this;
    const x = idx % width, y = Math.floor(idx / width);
    return [x,y];
};
Template.prototype.readChannel = function*(ID) {
    const channel = this.channels[ID];
    for(const pixelID of channel) {
        yield this.getXY(pixelID);
    }
};
Template.prototype.getIdx = function(x,y) {
    return y * this.height + x;
};
Template.prototype.inRange = function(x,y) {
    const {width,height} = this;
    return x >= 0 && x < width && y >= 0 && y < height;
};
Template.prototype.get = function(x,y,map) {
    if(!this.inRange(x,y)) {
        return ColorIDs.None;
    }
    if(!map) {
        map = this.map;
    }
    const idx = this.getIdx(x,y);
    return map[idx];
};
Template.prototype.clone = function() {
    return this.map.slice(0);
};
export default Template;
