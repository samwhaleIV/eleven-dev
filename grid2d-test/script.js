const {ResourceManager, CanvasManager, Grid2D} = Eleven;

const MAP_NAME = "my_swamp";
const UVTC_TILE_SIZE = 16;

function World() {
    const grid = new Grid2D(UVTC_TILE_SIZE);

    const camera = grid.camera;
    const panZoom = grid.getPanZoom();

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

        tileRenderer.layerCount = 1;
        tileRenderer.layerStart = 0;
        grid.cache();
        tileRenderer.layerStart = 1;
        tileRenderer.paused = false;

        tileRenderer.background = (context,{width,height}) => {
            context.fillStyle = "black";
            context.fillRect(0,0,width,height);
        };
        tileRenderer.start = context => {
            context.save();
            context.translate(0,0);
            context.globalCompositeOperation = "multiply";
        };
        tileRenderer.render = context => {
            const {x,y} = grid.getLocation(camera.x,camera.y);
            const tileSize = grid.tileSize;
            context.fillStyle = "red";
            context.fillRect(x,y,tileSize,tileSize);
        };
        tileRenderer.finalize = context => {
            context.restore();
        };

        camera.center();
    };

    grid.bindToFrame(this);
    panZoom.bindToFrame(this);

    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };

    //For debugging...
    this.grid = grid;
    this.camera = camera;
};

CanvasManager.start({
    frame: World,
    markLoaded: true
});
