import ImageGen from "./image-gen.js";

const {CanvasManager} = Eleven;

function Debug() {

    this.PanZoomWorld = () => {
        const frame = CanvasManager.frame;
        const panZoom = frame.grid.getPanZoom();
        frame.spriteFollower.disable();
        panZoom.bindToFrame(frame);
    };

    this.SaveCanvas = canvas => {
        if(!canvas) canvas = CanvasManager.canvas;
        canvas.convertToBlob({
            type: "image/png"
        }).then(function(blob) {
            window.open(URL.createObjectURL(blob));
        });
    };

    this.GenerateDevImages = () => {
        ImageGen({
            save: this.SaveCanvas,
            collision: true, interaction: true
        });
    };

    this.WorldBenchmark = async () => {
        await SVCC.Runtime.LoadWorld();
        const world = CanvasManager.frame;
        await world.setLevel("PondHell");
        world.spriteFollower.disable();
        const {camera} = world;
        camera.y = 8.682142857142857;
        camera.x = 23.07142857142857;
        camera.scale = 5;
    };

    Object.freeze(this);
}

export default Debug;
