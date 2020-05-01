import World from "./world/world.js";
import InputServer from "./user-interface/input-server.js";
import SaveState from "./storage/save-state.js";
import Scripts from "./scripts/manifest.js";
import Constants from "./constants.js";
import Inventory from "./items/inventory.js";
import saveState from "./storage/save-state.js";

const PRELOAD_SCRIPT = Constants.GamePreloadScript;
const SAVE_STATE_ADDRESS = Constants.SaveStateAddress;
const GLOBAL_PRELOAD = Constants.GlobalResourceFile;

const CLEAN_SLATE = "CleanSlate";
const CONTAINERS = "Containers";
const CONTAINER = "Container";

const {CanvasManager, ResourceManager} = Eleven;

const DEV_SAVE = Constants.DevSaveFile;

function Runtime() {

    const inputServer = new InputServer();

    const scriptCount = Object.keys(Scripts).length;
    console.log(`%cLoaded ${scriptCount} script${scriptCount!==1?"s":""} from './scripts/manifest.js'`,"background: white; color: black",Scripts);

    const setFrame = async (frame,parameters) => {
        inputServer.managedGamepad.reset();
        await CanvasManager.setFrame(frame,parameters);
    };
    
    this.LoadWorld = async script => {
        if(!CanvasManager.paused) {
            CanvasManager.paused = true;
            CanvasManager.markLoading();
        }

        await setFrame(World,[async world=>{
            if(script) await world.runScript(script);
        }]);

        if(DEV) {
            globalThis.world = CanvasManager.frame;
            globalThis.inventory = this.Inventory;
        }

        if(CanvasManager.paused) {
            CanvasManager.paused = false;
            CanvasManager.markLoaded();
        }
    };

    //use world.unloadScript when the runtime switches away from the world

    this.InputServer = inputServer;
    const inputWatchID = inputServer.addChangeListener(()=>{
        const {frame} = CanvasManager;
        if(!frame || !frame.refreshInput) return;
        frame.refreshInput(inputServer.getBinds());
    });

    this.SaveState = SaveState;

    console.log(`Runtime is watching key bind changes (ID: ${inputWatchID})`);

    const globalPreload = async () => {
        await ResourceManager.queueText(GLOBAL_PRELOAD + ".json").load();
        const manifest = ResourceManager.getText(GLOBAL_PRELOAD);
        await ResourceManager.queueManifest(manifest).load();
    };

    this.Start = async () => {
        await globalPreload();
        console.log("Use 'index-dev.html', there is not a release candidate yet!");
        window.location.href += "index-dev.html"; return;
    };

    let inventory = null;

    Object.defineProperty(this,"Inventory",{
        get: () => inventory,
        enumerable: true
    });

    this.DevStart = async () => {
        await globalPreload();

        await ResourceManager.queueJSON(DEV_SAVE).load();

        const devSave = ResourceManager.getJSON(DEV_SAVE);

        if(devSave) {

            if(DEMO || devSave[CLEAN_SLATE]) saveState.hardReset();

            const container = DEMO ? "Demo" : devSave[CONTAINER];
            const containers = devSave[CONTAINERS];

            if(container && containers) {
                localStorage.setItem(SAVE_STATE_ADDRESS,JSON.stringify(
                    containers[container]
                ));
            }
        }

        SaveState.load();

        inventory = new Inventory();

        this.LoadWorld(PRELOAD_SCRIPT);
    };

    Object.freeze(this);
}
export default Runtime;
