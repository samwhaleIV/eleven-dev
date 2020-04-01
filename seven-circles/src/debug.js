import ShowDevKeyBindMenu from "./dev-keybinds.js";
import Constants from "./constants.js";

const {CanvasManager} = Eleven;

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

    this.ConfigKeyBinds = ShowDevKeyBindMenu;

    Object.freeze(this);
}
export default Debug;
