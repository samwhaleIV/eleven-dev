const INTERNAL_LAYERS = 10;
const INTERNAL_LAYER_SIZE = 300;

const STAR_COLOR = "white";
const SPACE_COLOR = "black";

const LAYER_TIME = 100 * 1000;
const MAX_LAYER_SCALE = 300;
const LAYER_COUNT = 32;
const RENDER_SCALE_THRESHOLD = 2 / 8;
const T_POWER = 16;

const STAR_COUNT = 45;
const STAR_SIZE = 1;

const getStarPosition = dimensionLength => {
    return Math.round(Math.random() * dimensionLength);
};

const drawStars = (context,width,height) => {
    for(let i = 0;i<STAR_COUNT;i++) {
        const x = getStarPosition(width);
        const y = getStarPosition(height);
        context.rect(x,y,STAR_SIZE,STAR_SIZE);
    }
};

const getInternalLayer = (buffer,context) => {
    const {width, height} = buffer;

    context.clearRect(0,0,width,height);
    context.beginPath();

    drawStars(context,width,height);

    context.fillStyle = STAR_COLOR;
    context.fill();
    return buffer.transferToImageBitmap();
};

const getInternalLayers = () => {
    const buffer = new OffscreenCanvas(
        INTERNAL_LAYER_SIZE,INTERNAL_LAYER_SIZE
    );
    const context = buffer.getContext("2d",{alpha:true});
    context.imageSmoothingEnabled = true;
    const layers = new Array(INTERNAL_LAYERS);
    for(let i = 0;i<layers.length;i++) {
        layers[i] = getInternalLayer(buffer,context);
    }
    return layers;
};

const layers = getInternalLayers();

function StarField() {
    const layerSize = layers[0].width;
    const halfLayerSize = layerSize / 2;

    const layerBuffer = new Array();

    const addLayer = time => {
        const layer = layers[Math.floor(Math.random()*layers.length)];
        layerBuffer.push([layer,time]);
    };
    const dropLayer = () => {
        layerBuffer.shift();
    };

    const offsets = new Array();
    let startTime = performance.now();

    const layerSpacing = LAYER_TIME / LAYER_COUNT;
    for(let i = 0;i<LAYER_COUNT;i++) {
        const offset = layerSpacing * i;
        offsets[i] = offset;
        addLayer(startTime + offset - LAYER_TIME);
    }

    this.render = (context,{halfWidth,halfHeight,width,height},{now}) => {
        context.fillStyle = SPACE_COLOR;
        context.fillRect(0,0,width,height);

        context.imageSmoothingEnabled = true;

        const buffer = layerBuffer.slice(0);

        for(let i = 0;i<buffer.length;i++) { //may have to reverse the looop...

            const [image,startTime] = buffer[i];

            let layerT = (now - startTime) / LAYER_TIME;
            
            if(layerT <= 0) continue;

            if(layerT > 1) {
                layerT = 1;
                dropLayer(); addLayer(now - offsets[i]);
            }

            const layerScale = Math.pow(1-layerT,T_POWER) * MAX_LAYER_SCALE;
            if(layerScale < RENDER_SCALE_THRESHOLD) continue;

            context.translate(halfWidth,halfHeight);

            context.scale(layerScale,layerScale);

            context.drawImage(
                image,0,0,layerSize,layerSize,
                -halfLayerSize,-halfLayerSize,layerSize,layerSize
            );
            context.resetTransform();
        }

        context.imageSmoothingEnabled = false;
    }
}
export default StarField;
