function World() {
    const grid = new Eleven.Grid2D();
    const tileRenderer = new Eleven.TileRenderer(grid,{
        width: 16, height: 16, layers: 1
    });
    grid.renderer = tileRenderer;

    tileRenderer.renderData.forEach(layer => {
        for(let i = 0;i<layer.length;i++) layer[i] = i;
    });

    const camera = grid.camera.center();
    const panZoom = grid.getPanZoom();

    this.load = async () => {
        const resourceDictionary = await Eleven.ResourceManager.queueManifest(`{
            "Image": ["tileset.png"]
        }`).loadWithDictionary();
        grid.renderer.tileset = resourceDictionary.Image.tileset;
    };

    grid.bindToFrame(this);
    panZoom.bindToFrame(this);

    //For debugging...
    this.grid = grid;
    this.camera = camera;
};

Eleven.CanvasManager.start({
    frame: World,
    markLoaded: true
});
