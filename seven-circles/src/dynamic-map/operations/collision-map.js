const {CollisionBase} = Eleven;

const BAD_OPERATION = () => {
    throw Error("A tile collision layer was already generated!");
};

function HardcoreTileCollision(collisionList,columns,rows) {
    CollisionBase.call(this,{
        baseTileSize: 16,
        width: columns,
        height: rows
    },1);

    let lookupCounter = 1;
    const lookup = new Array();
    const valueProcessor = value => lookup[value];

    const writeCollisionLayer = () => {
        for(const data of collisionList) {
            const ID = lookupCounter;
            lookupCounter++;
            lookup[ID] = data;
            this.mapSprite(data,ID);
        }
    };

    const reset = () => {
        console.warn("Dynamic collision layers are immutable!");
    };
    writeCollisionLayer();

    const collides = this.getCollisionTest(valueProcessor);
    this.reset = reset;
    this.collides = collides;
}
HardcoreTileCollision.prototype = CollisionBase.prototype;

function GetCollisionList(layer,width,height,scale) {
    const smallWidth = Math.floor(width * scale);
    const smallHeight = Math.floor(height * scale);

    const smallBuffer = new OffscreenCanvas(smallWidth,smallHeight);
    const bigBuffer = new OffscreenCanvas(width,height);

    const smallContext = smallBuffer.getContext("2d",{alpha:true});
    const bigContext = bigBuffer.getContext("2d",{alpha:true});

    smallContext.imageSmoothingEnabled = false;
    bigBuffer.imageSmoothingEnabled = false;

    bigContext.beginPath();
    for(const [x,y] of layer) {
        bigContext.rect(x,y,1,1);
    }
    bigContext.fillStyle = "#FF0000";
    bigContext.fill();

    smallContext.drawImage(bigBuffer,0,0,width,height,0,0,smallWidth,smallHeight);

    const {data} = smallContext.getImageData(0,0,smallWidth,smallHeight);
    const dataLength = data.length;

    const collisionList = [];

    const layerOffset = 1 / 16;

    for(let i = 0;i<dataLength;i+=4) {
        if(data[i] !== 255) continue;
        const idx = i / 4;
        const pixelX = idx % smallWidth, pixelY = Math.floor(idx / smallWidth);

        const worldX = pixelX * scale, worldY = pixelY * scale;
        collisionList.push({
            x: worldX + layerOffset, y: worldY + layerOffset,
            width: scale,
            height: scale
        });
    }
    return collisionList;
}

function CollisionMap({buffer,layer}) {
    if(buffer.tileCollision) BAD_OPERATION();
    const {template} = buffer;

    const baseSize = 16;

    const columns = Math.ceil(template.width / baseSize);
    const rows = Math.ceil(template.height / baseSize);

    const collisionList = GetCollisionList(
        layer,template.width,template.height,1/4
    );
    const tileCollision = new HardcoreTileCollision(
        collisionList,columns,rows
    );

    buffer.tileCollision = tileCollision;
}
export default CollisionMap;
