import {AddNamedBackground} from "./color-background.js";

const COLOR_ONE = "#EF0067";
const COLOR_TWO = "#B7004F";

const BACKGROUND_PARALLAX = -0.25;
const TILE_SCALE = 2;

const FALLBACK_COLOR = COLOR_ONE;

function GetPattern(buffer,tileSize) {
    tileSize *= TILE_SCALE;
    const halfSize = tileSize / 2;

    buffer.width = tileSize, buffer.height = tileSize;

    const context = buffer.getContext("2d",{alpha:false});
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "low";

    context.fillStyle = COLOR_ONE;
    context.fillRect(0,0,tileSize,tileSize);

    context.fillStyle = COLOR_TWO;
    context.rect(0,0,halfSize,halfSize);
    context.rect(halfSize,halfSize,halfSize,halfSize);
    context.fill();

    const basePattern = context.createPattern(buffer,"repeat");

    let lastPattern = null, lastX = null, lastY = null;

    return (xOffset=0,yOffset=0) => {
        if(xOffset === lastX && lastY === yOffset) {
            return lastPattern;
        }
        lastX = xOffset, lastY = yOffset;

        xOffset *= tileSize, yOffset *= tileSize;
        context.fillStyle = basePattern;

        context.beginPath();
        context.rect(0,0,tileSize,tileSize);
        context.translate(xOffset,yOffset);
        context.fill();
        context.translate(-xOffset,-yOffset);

        const pattern = context.createPattern(buffer,"repeat");
        lastPattern = pattern;
        return pattern;
    };
}

function AddPalaceFloor(world) {

    const buffer = new OffscreenCanvas(0,0);

    let pattern = () => FALLBACK_COLOR, tileSize = 0;
    const resize = () => {
        const newTileSize = world.grid.tileSize;
        if(newTileSize === tileSize) return;
        tileSize = newTileSize;
        pattern = GetPattern(buffer,tileSize);
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

    const render = (context,{width,height}) => {
        const parallaxX = getParallax(camera.x);
        const parallaxY = getParallax(camera.y);

        context.fillStyle = pattern(parallaxX,parallaxY);

        const topLeft = grid.getLocation(0,0);
        const bottomRight = grid.getLocation(grid.width,grid.height);

        const [x,renderWidth] = normalizeRange(
            topLeft.x,bottomRight.x,width
        );
        const [y,renderHeight] = normalizeRange(
            topLeft.y,bottomRight.y,height
        );

        context.fillRect(x,y,renderWidth,renderHeight);
    };

    AddNamedBackground(world,"palace");
    dispatchRenderer.addBackground(render);
}
export default AddPalaceFloor;
