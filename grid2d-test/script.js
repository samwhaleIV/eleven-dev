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

        const tileRenderer = new grid.TileRenderer({
            setSize: true,
            map: maps[MAP_NAME],
            uvtc: true
        });

        grid.renderer = tileRenderer;

        const tileset = ResourceManager.getImage("world-tileset");
        
        grid.renderer.tileset = tileset;
        grid.cache();

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
