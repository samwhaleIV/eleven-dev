import ZIndexBook from "./z-indices.js";
import Constants from "../constants.js";

const {TextLayer} = Eleven;

const BOTTOM_MARGIN = Constants.WorldUIScreenMargin;

const WIDTH = 800;
const HEIGHT = 300;
const TEXT_SCALE = 4;
const ROW_SPACING = 0.5;
const BOX_PADDING = 4;
const TEXT_SPACING = 0.5;

const textLayerDefaults = Object.freeze({
    rowSpacing: ROW_SPACING,
    boxPadding: BOX_PADDING,
    scale: TEXT_SCALE,
    textSpacing: TEXT_SPACING,
    width: WIDTH,
    height: HEIGHT
});

function GetTextLayer(data) {
    const dataContainer = Object.assign(
        new Object(),textLayerDefaults
    );
    if(typeof data === "string" || Array.isArray(data)) {
        dataContainer.text = data;
    } else {
        Object.assign(dataContainer,data);
    }
    return new TextLayer(dataContainer);
}


function GetRenderer(container,target="textLayer") {
    return (context,{halfWidth,height}) => {
        const textLayer = container[target]; if(!textLayer) return;
        const x = Math.floor(halfWidth - textLayer.width / 2);
        const y = height - textLayer.height - BOTTOM_MARGIN;
        context.fillStyle = "white";
        context.fillRect(x,y,textLayer.width,textLayer.height);
        textLayer.render(context,x,y);
    };
}
function AddRenderer(dispatchRenderer,container,target) {
    const renderer = GetRenderer(container,target);
    const rendererID = dispatchRenderer.addFinalize(
        renderer,ZIndexBook.WorldMessage
    );
    return () => dispatchRenderer.removeFinalize(rendererID);
}

const MessageHelper = Object.freeze({
    GetTextLayer, AddRenderer, GetRenderer
});

export default MessageHelper;
