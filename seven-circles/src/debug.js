import Constants from "./constants.js";
import ImageGen from "./image-gen.js";

const {CanvasManager} = Eleven;

function Debug() {

    this.PanZoomWorld = () => {
        const frame = CanvasManager.frame;
        const panZoom = frame.grid.getPanZoom();
        frame.spriteFollower.disable();
        panZoom.bindToFrame(frame);
    };

    this.RetroMode = () => {
        (({Width,Height}) => {
        CanvasManager.setSize(Width,Height);
        })(Constants.RetroResolution); 
        CanvasManager.enableBoxFill();
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

    Object.freeze(this);
}

export default Debug;
