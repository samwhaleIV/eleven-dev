import World from "./world/world.js";
import InputServer from "./user-interface/input-server.js";
import SaveState from "./storage/save-state.js";

const START_SCRIPT = "HelloWorld";

const {CanvasManager} = Eleven;

function Runtime() {
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

    const saveState = new SaveState();
    this.SaveState = saveState;
    saveState.load();

    console.log(`Runtime is watching key bind changes (ID: ${inputWatchID})`);

    this.Start = () => {
        console.log("Hello, world!");
        this.LoadWorld(HelloWorld);
    };
}
export default Runtime;
