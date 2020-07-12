function Pattern(decoratorBuffer,image,x,y,width,height) {
    const buffer = new OffscreenCanvas(width,height);
    const context = buffer.getContext("2d",{alpha:false});
    context.drawImage(image,x,y,width,height,0,0,width,height);

    const colors = {};
    const {data} = context.getImageData(0,0,width,height);
    const dataLength = data.length;

    const patternMap = new Array(width);
    for(let x = 0;x<width;x++) {
        patternMap[x] = new Array(height).fill(0);
    }

    const hash = (r,g,b) => [r,g,b].join(",");

    for(let i = 0;i<dataLength;i+=4) {
        const r = data[i], g = data[i+1], b = data[i+2];

        const idx = i / 4;
        const x = idx % width, y = Math.floor(idx / width);
    
        const color = hash(r,g,b);
        if(!(color in colors)) {
            colors[color] = decoratorBuffer.addColor([r,g,b,255]);
        }
        patternMap[x][y] = colors[color];
    }

    Object.assign(this,{patternMap,width,height});
}
Pattern.prototype.getColor = function(x,y) {
    /* CPU compositing is for real men. God save our cycles. */
    const {width,height,patternMap} = this;
    return patternMap[x % width][y % height];
};
export default Pattern;
