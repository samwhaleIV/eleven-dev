import World from "./world/world.js";
import Constants from "./constants.js";
import TestScript from "./world-scripts/test-script.js";

const {CanvasManager, AudioManager, ResourceManager} = Eleven;

function SetupCanvasManagerSizing() {
    (({Width,Height}) => {

    CanvasManager.setSize(Width,Height);

    })(Constants.GameResolution);
        
    CanvasManager.enableBoxFill();
}

function Runtime() {
    SetupCanvasManagerSizing();

    this.LoadWorld = async script => {
        if(!CanvasManager.paused) {
            CanvasManager.paused = true;
            CanvasManager.markLoading();
        }

        await Eleven.CanvasManager.setFrame(World,[world=>{
            world.runScript(script);
        }]);

        if(CanvasManager.paused) {
            CanvasManager.paused = false;
            CanvasManager.markLoaded();
        }
    };

    this.Start = () => {
        console.log("Hello, world!");
        this.LoadWorld(TestScript);
    };
}
export default Runtime;
