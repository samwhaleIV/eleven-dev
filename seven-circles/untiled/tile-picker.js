function TilePicker() {
    const canvas = document.createElement("canvas");
    canvas.id = "tile-picker";

    const context = canvas.getContext("2d");

    let activeTileset = null, tileRows = 0, tileColumns = 0;

    this.setTileset = tileset => {
        const {width,height} = tileset;
        tileColumns = width / 16;
        tileRows = height / 16;
        activeTileset = tileset;
        this.update();
    };

    const camera = {
        x: 0,y: 0,scale: 4
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
    };

    this.update = () => {
        render();
    };

    this.element = canvas;
}
export default TilePicker;
