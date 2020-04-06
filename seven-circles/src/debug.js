import DevKeyBindMenu from "./dev-keybinds.js";
import Constants from "./constants.js";
import ImageGen from "./image-gen.js";

const {CanvasManager,DOMInterface} = Eleven;

function Debug() {
    this.PanZoomWorld = () => {
        //This may or may not work, the frame has to be a grid2D world
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

    const keyBindMenu = DOMInterface.getMenu(DevKeyBindMenu);
    this.ConfigKeyBinds = () => keyBindMenu.show();

    const testMenu = DOMInterface.getMenu(TestMenu);
    this.ShowTestMenu = () => testMenu.show();
    this.CloseTestMenu = () => testMenu.close();
    this.TestMenuIsVisible = () => testMenu.visible;

    this.SaveCanvas = canvas => {
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

function TestMenu() {
    const div = document.createElement("div");
    div.classList.add("center");
    div.style.width = "400px";
    div.style.height = "400px";
    div.style.backgroundColor = "orange";
    return div;
}

export default Debug;
