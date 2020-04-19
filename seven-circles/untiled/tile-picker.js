function TilePicker(app) {
    const canvas = document.createElement("canvas");
    canvas.id = "tile-picker";

    const context = canvas.getContext("2d");

    let activeTileset = null, tileRows = 0, tileColumns = 0;

    let selection = {
        anchorX: 0,
        anchorY: 0,
        x: 1,
        y: 0,
        width: 1,
        height: 1
    };

    const updateBrush = () => {
        const valueMatrix = new Array(selection.height);

        for(let y = 0;y<selection.height;y++) {
            const row = new Array(selection.width);
            for(let x = 0;x<selection.width;x++) {
                row[x] = (selection.x+x) + (selection.y+y) * tileColumns;
            }
            valueMatrix[y] = row;
        }

        app.updateBrush({
            width: selection.width,
            height: selection.height,
            value: valueMatrix
        });
    };

    
    const camera = {
        x: 0,y: 0, scale: 4
    };

    this.setTileset = tileset => {
        const {width,height} = tileset;

        const oldColumns = tileColumns;
        const oldRows = tileRows;

        tileColumns = width / 16;
        tileRows = height / 16;

        if(tileset !== activeTileset) {
            updateBrush();
            if(oldRows !== tileRows || oldColumns !== tileColumns) {
                camera.x = 0;
                camera.y = 0;
            }
        }

        activeTileset = tileset;
        this.update();
    };

    const render = () => {
        if(!activeTileset) return;
        context.imageSmoothingEnabled = false;

        const tileSize = camera.scale * 16;

        const horizontalTiles = Math.ceil(canvas.width / tileSize);
        const verticalTiles = Math.ceil(canvas.height / tileSize);

        const startX = camera.x;
        const startY = camera.y;
        const endX = startX + horizontalTiles;
        const endY = startY + verticalTiles;

        let renderX = 1, renderY = 0;

        context.fillStyle = "black";
        context.fillRect(0,0,canvas.width,canvas.height);

        for(let x = startX;x < endX;x++) {
            for(let y = startY;y < endY;y++) {

                context.fillStyle = "#7F7F7F";
                context.fillRect(renderX,renderY,tileSize,tileSize);

                context.drawImage(activeTileset,x*16,y*16,16,16,renderX,renderY,tileSize,tileSize);

                renderY += tileSize + 1;
            }
            renderY = 0;
            renderX += tileSize + 1;
        }

        context.fillStyle = "rgba(0,128,255,0.5)";
        
        const selectionX = (selection.x - camera.x) * (tileSize+1);
        const selectionY = (selection.y - camera.y) * (tileSize+1);

        context.fillRect(
            1 + selectionX, selectionY,
            (tileSize+1) * selection.width,
            (tileSize+1) * selection.height
        );
    };

    this.update = render;

    let selecting = false;

    canvas.addEventListener("wheel",function(event){
        event.preventDefault();
        event.stopPropagation();

        if(selecting) return;

        const scrollingUp = event.deltaY < 0;

        if(event.altKey) {
            if(scrollingUp) {
                camera.x-=2;
            } else {
                camera.x+=2;
            }
        } else {
            if(scrollingUp) {
                camera.y-=2;
            } else {
                camera.y+=2;
            }
        }

        if(camera.x < 0) {
            camera.x = 0;
        }
        if(camera.y < 0) {
            camera.y = 0;
        }

        render();
    });

    const getXY = (mouseX,mouseY) => {
        return [
            Math.floor(camera.x + mouseX / (camera.scale * 16)),
            Math.floor(camera.y + mouseY / (camera.scale * 16))
        ];
    };

    const rotationalSelectCalculation = (value,anchorTarget,boundTarget,valueTarget) => {
        const anchor = selection[anchorTarget];
        if(value < anchor) {
            selection[valueTarget] = value;
            selection[boundTarget] = anchor - value + 1;
        } else {
            selection[valueTarget] = anchor;
            selection[boundTarget] = value - anchor + 1;
        }
    };

    const updateSelection = (x,y) => {
        rotationalSelectCalculation(x,"anchorX","width","x");
        rotationalSelectCalculation(y,"anchorY","height","y");
    };

    const setSelectionStart = (mouseX,mouseY) => {
        const [x,y] = getXY(mouseX,mouseY);
        selection.anchorX = x;
        selection.anchorY = y;
        updateSelection(x,y);
        render();
    };
    const setSelectionEnd = (mouseX,mouseY) => {
        const [x,y] = getXY(mouseX,mouseY);
        updateSelection(x,y);
        render();
    };

    canvas.addEventListener("mousedown",function(event){
        if(event.button !== 0) return;
        setSelectionStart(event.layerX,event.layerY);
        selecting = true;
    });
    canvas.addEventListener("mousemove",function(event){
        if(!selecting) return;
        setSelectionEnd(event.layerX,event.layerY);
    });
    canvas.addEventListener("mouseup",function(event){
        if(!selecting) return;
        setSelectionEnd(event.layerX,event.layerY);
        selecting = false;
        updateBrush();
    });

    this.element = canvas;
}
export default TilePicker;
