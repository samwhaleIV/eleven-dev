import World from "./world/world.js";
import InputServer from "./user-interface/input-server.js";
import SaveState from "./storage/save-state.js";
import Scripts from "./scripts/manifest.js";
import Constants from "./constants.js";
import saveState from "./storage/save-state.js";

const PRELOAD_SCRIPT = Constants.GamePreloadScript;

const USE_DEV_SAVE_KEY = "_UseDevSave";

const {CanvasManager, ResourceManager} = Eleven;

const DEV_SAVE = "dev-save";

function Runtime() {

    const scriptCount = Object.keys(Scripts).length;
    console.log(`%cLoaded ${scriptCount} script${scriptCount!==1?"s":""} from './scripts/manifest.js'`,"background: white; color: black",Scripts);

    this.LoadWorld = async (script,...parameters) => {
        if(!CanvasManager.paused) {
            CanvasManager.paused = true;
            CanvasManager.markLoading();
        }

        await Eleven.CanvasManager.setFrame(World,[async world=>{
            if(script) await world.runScript(script,...parameters);
        }]);

        if(CanvasManager.paused) {
            CanvasManager.paused = false;
            CanvasManager.markLoaded();
        }
    };

    //use world.unloadScript when the runtime switches away from the world

    this.RunWorldScript = async (script,...parameters) => {
        await Eleven.CanvasManager.frame.runScript(script,...parameters);
    };

    const inputServer = new InputServer();
    this.InputServer = inputServer;
    const inputWatchID = inputServer.addChangeListener(()=>{
        const {frame} = CanvasManager;
        if(!frame || !frame.refreshInput) return;
        frame.refreshInput(inputServer.getBinds());
    });

    this.SaveState = SaveState;

    console.log(`Runtime is watching key bind changes (ID: ${inputWatchID})`);

    this.Start = () => {
        console.log("Use 'index-dev.html', there is not a release candidate yet!");
        window.location.href += "index-dev.html"; return;
    };
    this.DevStart = async () => {
        localStorage.clear();
        await ResourceManager.queueJSON(DEV_SAVE).load();

        const devSave = ResourceManager.getJSON(DEV_SAVE);

        if(devSave && devSave[USE_DEV_SAVE_KEY]) {
            localStorage.setItem(SaveState.address,JSON.stringify(devSave));
        }

        SaveState.load();
        this.LoadWorld(PRELOAD_SCRIPT);
    };

    Object.freeze(this);
}
export default Runtime;
