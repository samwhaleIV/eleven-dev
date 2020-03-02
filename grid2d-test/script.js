const {ResourceManager, CanvasManager, Grid2D, SpriteLayer} = Eleven;

const MAP_NAME = "my_swamp";
const UVTC_TILE_SIZE = 16;

function TestSprite() {
    this.x = 50;
    this.y = 50;

    this.width = 1;
    this.height = 1;

    this.xDelta = 0;
    this.yDelta = 0;

    this.tilesPerSecond = 6;

    this.render = (context,x,y,width,height) => {
        context.fillStyle = "red";
        context.fillRect(x,y,width,height);
        this.didRender = true;
    };
}

function World() {
    const grid = new Grid2D(UVTC_TILE_SIZE);

    const camera = grid.camera;
    const panZoom = grid.getPanZoom();

    let sprite = null;

    this.load = async () => {
        await ResourceManager.queueManifest(`{
            "Image": ["world-tileset.png"],
            "JSON": ["uvtc-map-data.json"]
        }`).load();

        const maps = ResourceManager.getJSON("uvtc-map-data");
        const tileset = ResourceManager.getImage("world-tileset");

        const tileRenderer = grid.getTileRenderer({
            tileset: tileset,
            setRenderer: true, setSize: true,
            map: maps["my_swamp"],
            uvtcDecoding: true
        });

        tileRenderer.layerCount = 2;
        tileRenderer.layerStart = 0;
        grid.cache();
        tileRenderer.paused = true;

        const spriteLayer = new SpriteLayer(grid);
        spriteLayer.bindToRenderer(tileRenderer);

        tileRenderer.background = (context,{width,height}) => {
            context.fillStyle = sprite.didRender ? "white" : "red";
            context.fillRect(0,0,width,height);
            sprite.didRender = false;
        };

        sprite = new TestSprite();

        spriteLayer.add(sprite);

        camera.center();
        camera.padding = true;
    };

    grid.bindToFrame(this);
    //panZoom.bindToFrame(this);

    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };

    this.input = (downKeys,{delta}) => {
        if(!sprite) return;
        const upDown = "KeyW" in downKeys;
        const downDown = "KeyS" in downKeys;
        const leftDown = "KeyA" in downKeys;
        const rightDown = "KeyD" in downKeys;

        let xDelta = 0;
        let yDelta = 0;

        if(upDown) yDelta--;
        if(downDown) yDelta++;
        if(leftDown) xDelta--;
        if(rightDown) xDelta++;

        const deltaSecond = delta / 1000;
        const speed = sprite.tilesPerSecond * deltaSecond;
        sprite.x += xDelta * speed;
        sprite.y += yDelta * speed;

        camera.x = sprite.x;
        camera.y = sprite.y;
    };

    //For debugging...
    this.grid = grid;
    this.camera = camera;
};

CanvasManager.start({
    frame: World,
    markLoaded: true
});
