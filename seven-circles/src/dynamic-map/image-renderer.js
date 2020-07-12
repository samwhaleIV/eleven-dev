function RenderImage(decoratorBuffer) {
    const {buffer,context,imageData} = decoratorBuffer.template;
    const {colorTable} = decoratorBuffer;

    const transparentBlack = [0,0,0,0];
    const getRGBA = value => {
        if(Array.isArray(value)) return value;
        if(value in colorTable) {
            return colorTable[value];
        } else {
            return transparentBlack;
        }
    };

    const {data} = imageData;
    const map = decoratorBuffer.getMap();
    for(let i = 0;i<map.length;i++) {
        const value = map[i];
        const [r,g,b,a] = getRGBA(value);

        const dataIdx = i * 4;

        data[dataIdx] = r, data[dataIdx+1] = g,
        data[dataIdx+2] = b, data[dataIdx+3] = a;
    }
    context.putImageData(imageData,0,0);
    return buffer;
}
export default RenderImage;
