const SurroundingFull = [
    [-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]
];
const SurroundingCardinal = [
    [1,0],[-1,0],[0,1],[0,-1]
];
const getMatrix = (cardinalOnly=false) => {
    return cardinalOnly ? SurroundingCardinal : SurroundingFull;
};

function Outline({buffer,layer,layerID},color,cardinalOnly) {

    color = buffer.addColor(color);
    const matrix = getMatrix(cardinalOnly);

    const CountSurrounding = (x,y) => {
        let count = 0;
        for(const [xOffset,yOffset] of matrix) {
            const value = buffer.get(x+xOffset,y+yOffset);
            if(value !== layerID) count += 1;
        }
        return count;
    };

    for(const [x,y] of layer) {
        const count = CountSurrounding(x,y);
        if(count >= 1) buffer.set(x,y,color);
    }
}
export default Outline;
