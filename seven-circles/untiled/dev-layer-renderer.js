const {ParseGrid2DMap} = Eleven;

function DevLayerRenderer(textureSize,data) {
    const tilesets = data.tilesets.slice().map(image => [image,image.width/textureSize]);
    delete data.tilesets;

    data = ParseGrid2DMap(data);
    const {
        columns, rows,
        layerCount, layerSize,
        renderData, skipZero
    } = data;

    const getIdx = (x,y) => {
        return x + y * columns;
    };
    const getLayerIdx = (x,y,layer) => {
        const layerOffset = layer * layerSize;
        return x + y * columns + layerOffset;
    };
    this.setTile = (x,y,value,layer=0) => {
        const idx = getLayerIdx(x,y,layer);
        renderData[idx] = value;
    };
    this.getTile = (x,y,layer=0) => {
        const idx = getLayerIdx(x,y,layer);
        return renderData[idx];
    };

    let renderLayerCount = 0;
    let renderLayerStart = 0;
    let renderLayerEnd = 0;

    this.setLayerRange = (start,length) => {
        renderLayerCount = length;
        renderLayerStart = start;
        renderLayerEnd = renderLayerStart + renderLayerCount;
    };
    this.setLayerRange(0,layerCount);

    let context, tileSize;
    this.configTileRender = data => {
        context = data.context;
        tileSize = data.tileSize;
    };

    const renderTexture = (layer,tileIndex,renderX,renderY) => {
        const [image,columns] = tilesets[layer];

        const textureX = tileIndex % columns * textureSize;
        const textureY = Math.floor(tileIndex / columns) * textureSize;

        context.drawImage(
            image,textureX,textureY,textureSize,textureSize,
            renderX,renderY,tileSize,tileSize
        );
    };

    const visibleLayers = (new Array(layerCount)).fill(true);

    this.setVisibleLayers = layerVisibility => {
        for(let i = Math.min(layerVisibility.length,layerCount)-1;i>=0;i--) {
            visibleLayers[i] = Boolean(layerVisibility[i]);
        }
    };

    this.renderTile = (x,y,renderX,renderY) => {
        const tileIndex = getIdx(x,y);
        let layer = renderLayerStart;
        do {
            if(visibleLayers[layer]) {
                const mapValue = renderData[tileIndex + layer * layerSize];
                if(!(skipZero && mapValue <= 0)) {
                    renderTexture(layer,mapValue,renderX,renderY);
                }
            }
            layer++;
        } while(layer < renderLayerEnd);
    };

    let paused = false;
    Object.defineProperties(this,{
        paused: {
            get: () => paused,
            set: value => paused = Boolean(value),
            enumerable: true
        },
        columns: {
            get: () => columns,
            enumerable: true
        },
        rows: {
            get: () => rows,
            enumerable: true
        },
        renderData: {
            value: renderData,
            enumerable: true
        },
        layerStart: {
            get: () => renderLayerStart,
            enumerable: true
        },
        maxLayerCount: {
            get: () => layerCount,
            enumerable: true
        },
        layerCount: {
            get: () => renderLayerCount,
            enumerable: true
        }
    });
}

export default DevLayerRenderer
