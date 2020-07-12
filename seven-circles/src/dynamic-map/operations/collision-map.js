const {CollisionBase} = Eleven;

const BAD_OPERATION = () => {
    throw Error("A tile collision layer was already generated!");
};

function CollisionMap({buffer,layer}) {
    if(buffer.tileCollision) BAD_OPERATION();

    const tileCollision = new HardcoreTileCollision(buffer.template);

    for(const [x,y] of layer) {
        tileCollision.addPixel(x,y);
    }

    buffer.tileCollision = tileCollision;
}
export default CollisionMap;
