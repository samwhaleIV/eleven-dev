import World from "./world/world.js";
import Constants from "./constants.js";
import TestScript from "./world-scripts/test-script.js";
import InputServer from "./user-interface/input-server.js";

const {CanvasManager, AudioManager, ResourceManager} = Eleven;

function SetupCanvasManagerSizing() {
    return;
    
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

        await Eleven.CanvasManager.setFrame(World,[async world=>{
            await world.runScript(script);
        }]);

        if(CanvasManager.paused) {
            CanvasManager.paused = false;
            CanvasManager.markLoaded();
        }
    };

    const inputServer = new InputServer();
    this.InputServer = inputServer;
    const inputWatchID = inputServer.addChangeListener(()=>{
        const {frame} = CanvasManager;
        if(!frame || !frame.refreshInput) return;
        frame.refreshInput(inputServer.getBinds());
    });

    console.log(`Runtime watching for input changes (ID: ${inputWatchID})`);

    this.Start = () => {
        console.log("Hello, world!");
        this.LoadWorld(TestScript);
    };
}
export default Runtime;
