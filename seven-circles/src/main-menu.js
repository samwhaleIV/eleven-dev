const {
    ResourceManager,
    Grid2D,
    DispatchRenderer,
    WaterBackground
} = Eleven;

function MainMenu() {
    const grid = new Grid2D(16);
    const camera = grid.camera;

    grid.bindToFrame(this);

    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };

    this.grid = grid;

    const dispatchRenderer = new DispatchRenderer();
    let tileRenderer = null;

    const updateForegroundTile = (x,y,value) => {
        grid.renderer = tileRenderer;
        tileRenderer.setTile(x,y,value,1);
        grid.cache(x,y,1,1);
        grid.renderer = dispatchRenderer;
    };

    this.clickDown = ({x,y}) => {
        const location = grid.getTileLocation(x,y);
        x = Math.floor(location.x);
        y = Math.floor(location.y);
        updateForegroundTile(x,y,5);
    };

    this.load = async () => {
        await ResourceManager.queueManifest(`{
            "Image": ["world-tileset.png"],
            "JSON": ["maps.json"]
        }`).load();

        const maps = ResourceManager.getJSON("maps");
        const tileset = ResourceManager.getImage("world-tileset");

        tileRenderer = grid.getTileRenderer({
            tileset: tileset,
            setRenderer: true, setSize: true,
            map: maps["menu"],
            uvtcDecoding: true
        });

        tileRenderer.layerCount = 2;
        tileRenderer.layerStart = 0;
        grid.cache();
        tileRenderer.paused = true;

        grid.renderer = dispatchRenderer;

        const waterBackground = new WaterBackground(grid,tileset,80,112,10000);

        dispatchRenderer.addResize(waterBackground.resize);
        dispatchRenderer.addBackground(waterBackground.render);

        camera.scale = 5;
        camera.center();
        camera.padding = false;
    };
}
export default MainMenu;
