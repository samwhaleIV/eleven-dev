import DevLayerRenderer from "./dev-layer-renderer.js";

const {Grid2D, DispatchRenderer} = Eleven;

function FakeWorld(tilesets) {
    const grid = new Grid2D(16);
    const camera = grid.camera;

    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };

    const dispatchRenderer = new DispatchRenderer();
    this.dispatchRenderer = dispatchRenderer;

    this.tileRenderer = null;
    
    const visibleLayers = (new Array(6)).fill(true);

    this.setMap = map => {
        dispatchRenderer.clear();

        const renderer = new DevLayerRenderer(16,{
            tilesets, map, uvtcDecoding: true
        });
        renderer.setVisibleLayers(visibleLayers);

        grid.setSize(renderer.columns,renderer.rows);
        this.tileRenderer = renderer;

        grid.renderer = renderer;
        grid.cache();
        grid.renderer = dispatchRenderer;
    };

    this.setVisibleLayers = (
        background,foreground,superForeground,
        collision,interaction,lighting
    ) => {
        if(!this.tileRenderer) return;

        visibleLayers[0] = background;
        visibleLayers[1] = foreground;
        visibleLayers[2] = superForeground;
        visibleLayers[3] = collision;
        visibleLayers[4] = interaction;
        visibleLayers[5] = lighting;

        this.tileRenderer.setVisibleLayers(visibleLayers);
        grid.renderer = this.tileRenderer;
        grid.cache();
        grid.renderer = dispatchRenderer;
    };
    this.getVisibleLayers = () => visibleLayers.slice(0);

    this.camera = camera;
    this.grid = grid;

    grid.bindToFrame(this);
    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };
};

FakeWorld.prototype.set = function(x,y,value,layer) {
    this.tileRenderer.setTile(x,y,value,layer);
    this.grid.renderer = this.tileRenderer;
    this.grid.cache(x,y,1,1);
    this.grid.renderer = this.dispatchRenderer;
}
FakeWorld.prototype.get = function(x,y,layer) {
    return this.tileRenderer.getTile(x,y,layer);
}

export default FakeWorld;
