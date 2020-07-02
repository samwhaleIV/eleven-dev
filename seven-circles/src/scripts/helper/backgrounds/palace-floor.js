import NamedColors from "./named-colors.js";

const COLOR_ONE = "#EF0067";
const COLOR_TWO = "#B7004F";

const BACKGROUND_PARALLAX = -0.25;

const TILE_SCALE = 2.5;

const FALLBACK_COLOR = COLOR_ONE;

function GetPattern(buffer,tileSize) {
    tileSize *= TILE_SCALE;

    const halfSize = tileSize / 2;

    buffer.width = tileSize, buffer.height = tileSize;

    const context = buffer.getContext("2d",{alpha:false});
    context.imageSmoothingEnabled = false;
    context.imageSmoothingQuality = "low";

    context.fillStyle = COLOR_ONE;
    context.fillRect(0,0,tileSize,tileSize);

    context.fillStyle = COLOR_TWO;
    context.rect(0,0,halfSize,halfSize);
    context.rect(halfSize,halfSize,halfSize,halfSize);
    context.fill();

    const pattern = context.createPattern(buffer,"repeat");

    let lastX = null, lastY = null;

    const matrix = new DOMMatrix();

    const updatePattern = (xOffset=0,yOffset=0) => {
        if(xOffset === lastX && lastY === yOffset) return;
        lastX = xOffset, lastY = yOffset;

        xOffset *= tileSize, yOffset *= tileSize;

        matrix.translateSelf(xOffset,yOffset);
        pattern.setTransform(matrix);
        matrix.translateSelf(-xOffset,-yOffset);
    };

    return {pattern,updatePattern};
}

function AddPalaceFloor(world) {

    const buffer = new OffscreenCanvas(0,0);

    let pattern = FALLBACK_COLOR;
    let updatePattern = null;
    let tileSize = 0;

    const resize = () => {
        const newTileSize = world.grid.tileSize;
        if(newTileSize === tileSize) return;
        tileSize = newTileSize;

        const patternData = GetPattern(buffer,tileSize);
        pattern = patternData.pattern;
        updatePattern = patternData.updatePattern;
    };

    const {camera,dispatchRenderer,grid} = world;
    dispatchRenderer.addResize(resize);

    const normalizeRange = (start,end,limit) => {
        start = Math.max(0,start);
        end = Math.min(limit,end);

        const length = Math.min(end - start,limit);

        return [start,length];
    };

    const getParallax = value => value * BACKGROUND_PARALLAX;

    const backgroundColor = NamedColors.palace;

    const render = (context,{width,height}) => {
        const parallaxX = getParallax(camera.x);
        const parallaxY = getParallax(camera.y);

        const topLeft = grid.getLocation(0,0);
        const bottomRight = grid.getLocation(grid.width,grid.height);

        const [x,renderWidth] = normalizeRange(
            topLeft.x,bottomRight.x,width
        );
        const [y,renderHeight] = normalizeRange(
            topLeft.y,bottomRight.y,height
        );

        if(x > 0 || renderWidth < width || y > 0 || renderHeight < height) {
            context.fillStyle = backgroundColor;
            context.fillRect(0,0,width,height);
        }

        if(updatePattern) updatePattern(parallaxX,parallaxY);

        context.fillStyle = pattern;
        const smoothingEnabled = context.imageSmoothingEnabled;
        context.imageSmoothingEnabled = true;
        context.fillRect(x,y,renderWidth,renderHeight);
        context.imageSmoothingEnabled = smoothingEnabled;
    };
    dispatchRenderer.addBackground(render);
}
export default AddPalaceFloor;
