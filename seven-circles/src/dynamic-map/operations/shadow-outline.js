const alphaBlend = (oldColor,newColor,alpha) => {
    return alpha * newColor + (1 - alpha) * oldColor;
};
const blendColors = (a,b,alpha) => [
    alphaBlend(a[0],b[0],alpha),
    alphaBlend(a[1],b[1],alpha),
    alphaBlend(a[2],b[2],alpha),
    255
];

function ShadowOutline(
    {buffer,layer},wallValue,distance,alpha,color
) {
    if(isNaN(distance)) distance = 8;
    if(isNaN(alpha)) alpha = 2 / 3;

    if(!color) {
        color = [0,0,0,255];
    } else {
        color = buffer.hexToRGB(color);
    }

    const getNearest = (startX,startY) => {
        let x = startX, y = startY;
        let nearestLeft = Infinity, nearestTop = Infinity;
        while(x >= 0) {
            const scanDistance = startX - x;
            if(scanDistance > distance) break;
            if(buffer.get(x,y) === wallValue) {
                nearestLeft = scanDistance;
            }
            x--;
        }
        x = startX;
        while(y >= 0) {
            const scanDistance = startY - y;
            if(scanDistance > distance) break;
            if(buffer.get(x,y) === wallValue) {
                nearestTop = scanDistance;
            }
            y--;
        }
        return Math.min(nearestLeft,nearestTop);
    };

    const {colorTable} = buffer;
    const blendTable = new Object();

    const hash = color => [color[0],color[1],color[2]].join(",");

    for(const [x,y] of layer) {
        if(getNearest(x,y) > distance) continue;
        const bufferColor = colorTable[buffer.getMask(x,y)];
        const blendTableKey = hash(bufferColor);

        if(!(blendTableKey in colorTable)) {
            const blendedColor = blendColors(bufferColor,color,alpha);
            const colorID = buffer.addColor(blendedColor);
            blendTable[blendTableKey] = colorID;
        }

        buffer.set(x,y,blendTable[blendTableKey]);
    }
}
export default ShadowOutline;
