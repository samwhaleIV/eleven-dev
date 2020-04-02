import World from "./world/world.js";
import InputServer from "./user-interface/input-server.js";
import SaveState from "./storage/save-state.js";
import Scripts from "./scripts/manifest.js";
import Constants from "./constants.js";

const PRELOAD_SCRIPT = Constants.GamePreloadScript;

const {CanvasManager} = Eleven;

function Runtime() {

    const scriptCount = Object.keys(Scripts).length;
    console.log(`%cLoaded ${scriptCount} script${scriptCount!==1?"s":""} from './scripts/manifest.js'`,"background: white; color: black",Scripts);

    this.LoadWorld = async script => {
        if(!CanvasManager.paused) {
            CanvasManager.paused = true;
            CanvasManager.markLoading();
        }

        await Eleven.CanvasManager.setFrame(World,[async world=>{
            if(script) await world.runScript(script);
        }]);

        if(CanvasManager.paused) {
            CanvasManager.paused = false;
            CanvasManager.markLoaded();
        }
    };

    //use world.unloadScript when the runtime switches away from the world

    this.RunWorldScript = async script => {
        await Eleven.CanvasManager.frame.runScript(script);
    };

    const inputServer = new InputServer();
    this.InputServer = inputServer;
    const inputWatchID = inputServer.addChangeListener(()=>{
        const {frame} = CanvasManager;
        if(!frame || !frame.refreshInput) return;
        frame.refreshInput(inputServer.getBinds());
    });

    this.SaveState = SaveState;
    SaveState.load();

    console.log(`Runtime is watching key bind changes (ID: ${inputWatchID})`);

    this.Start = () => {
        this.LoadWorld(PRELOAD_SCRIPT);
    };

    Object.freeze(this);
}
export default Runtime;
