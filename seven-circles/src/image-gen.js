import {CollisionTable} from "./world/collision-maker.js";
import Constants from "./constants.js";
const COLOR_ALPHA = "9F";
const COLLISION_COLOR = "#600000" + COLOR_ALPHA;
const NOT_AVA_COLOR = "black";
const NOT_AVA_TEXT = "n/a"; //No new lines allowed
const TEXT_COLOR = "white";
const TRIGGER_SUFFIX = "\ntri";

const CELL_SIZE = 16;

const TEXT_X_PADDING = 1;
const TEXT_Y_PADDING = -1;
const LINE_HEIGHT = 8;
const NOT_AVA_Y_PADDING = 1;

const INTERACTION_CELLS = 63;
const INTERACTION_TRIGGERS = Constants.TriggerTiles;

const INTERACTION_COLUMNS = 8;
const COLLISION_COLUMNS = 4;

const {GlyphTable} = Eleven;

const INTERACTION_COLORS = [
    "#2ABB00","#6C009E","#0065BB","#FF0040",
].map(color=>color+COLOR_ALPHA);

function drawCornerText(renderText,text,x,y) {
    let textX = x + TEXT_X_PADDING, textY = y + TEXT_Y_PADDING;
    for(const character of text) {
        if(character === "\n") {
            textX = x + TEXT_X_PADDING;
            textY += LINE_HEIGHT; continue;
        }
        textX += renderText(character,textX,textY) + 1;
    }
}

function generate(types,cellMaker,columns) {
    const canvas = new OffscreenCanvas(0,0);
    const context = canvas.getContext("2d",{alpha:true});
    const renderText = GlyphTable.getRenderer(context,1,TEXT_COLOR);

    const cellCount = types.length + 1;

    const rows = Math.ceil(cellCount / columns);

    canvas.width = columns * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;

    context.fillStyle = NOT_AVA_COLOR;
    context.fillRect(0,0,CELL_SIZE,CELL_SIZE);
    drawCornerText(renderText,NOT_AVA_TEXT,0,NOT_AVA_Y_PADDING);

    for(let i = 1;i<cellCount;i++) {
        let x = i % columns;
        let y = Math.floor(i / columns);

        x *= CELL_SIZE, y *= CELL_SIZE;

        cellMaker(context,renderText,types[i-1],x,y,CELL_SIZE);
    }

    return canvas;
}

function getInteractionTypes() {
    const interactionTypes = new Array(INTERACTION_CELLS);
    for(let i = 0;i<INTERACTION_CELLS;i++) {
        interactionTypes[i] = {value:i+1,isTrigger:false};
    }
    for(let i = 0;i<INTERACTION_TRIGGERS;i++) {
        interactionTypes[i].isTrigger = true;
    }
    return interactionTypes;
}

function collisionCellGen(context,renderText,cell,cellX,cellY,size) {
    let {x,y,width,height} = cell;

    x *= size, y *= size, width *= size, height *= size;

    context.fillStyle = COLLISION_COLOR;
    context.fillRect(cellX+x,cellY+y,width,height);
}
function interactionCellGen(context,renderText,cell,x,y,size) {
    let cellText = String(cell.value);
    if(cell.isTrigger) cellText += TRIGGER_SUFFIX;

    context.fillStyle = INTERACTION_COLORS[
        Math.floor(cell.value / (INTERACTION_COLUMNS * 2)) % INTERACTION_COLORS.length
    ];
    context.fillRect(x,y,size,size);

    drawCornerText(renderText,cellText,x,y);
}

function getCollisionTypes() {
    return CollisionTable.slice(1);
}

function ImageGen({collision,interaction,save}) {
    if(collision) save(generate(
        getCollisionTypes(),collisionCellGen,COLLISION_COLUMNS
    ));
    if(interaction) save(generate(
        getInteractionTypes(),interactionCellGen,INTERACTION_COLUMNS
    ));
}

export default ImageGen;
