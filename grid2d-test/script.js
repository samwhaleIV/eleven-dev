const MAP_NAME = "tumble_woods";
const UVTC_TILE_SIZE = 16;

function World() {
    const grid = new Eleven.Grid2D(UVTC_TILE_SIZE);

    const camera = grid.camera;
    const panZoom = grid.getPanZoom();

    this.load = async () => {
        await Eleven.ResourceManager.queueManifest(`{
            "Image": ["world-tileset.png"],
            "JSON": ["uvtc-map-data.json"]
        }`).load();

        const maps = Eleven.ResourceManager.getJSON("uvtc-map-data");

        grid.renderer = new Eleven.TileRenderer(grid,{
            map: maps[MAP_NAME],
            uvtc: true
        });
        
        grid.renderer.tileset = Eleven.ResourceManager.getImage("world-tileset");

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

Eleven.CanvasManager.start({
    frame: World,
    markLoaded: true
});
