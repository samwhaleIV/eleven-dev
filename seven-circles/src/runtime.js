import World from "./world/world.js";
import InputServer from "./user-interface/input-server.js";
import SaveState from "./storage/save-state.js";
import Scripts from "./scripts/manifest.js";
import Constants from "./constants.js";
import Inventory from "./items/inventory.js";
import MainMenu from "./main-menu/main-menu.js";

const PRELOAD_SCRIPT = Constants.GamePreloadScript;
const SAVE_STATE_ADDRESS = Constants.SaveStateAddress;
const GLOBAL_PRELOAD = Constants.GlobalResourceFile;

const CLEAN_SLATE = "CleanSlate";
const CONTAINERS = "Containers";
const CONTAINER = "Container";

const {CanvasManager, ResourceManager} = Eleven;

const DEV_SAVE = Constants.DevSaveFile;

const logScripts = () => {
    const scriptCount = Object.keys(Scripts).length;
    console.log(`%cLoaded ${scriptCount} script${scriptCount!==1?"s":""} from './scripts/manifest.js'`,"background: white; color: black",Scripts);
};

const getInputServer = () => {
    const inputServer = new InputServer();
    const inputWatchID = inputServer.addChangeListener(()=>{
        const {frame} = CanvasManager;
        if(!frame || !frame.refreshInput) return;
        frame.refreshInput(inputServer.getBinds());
    });

    console.log(`Runtime is watching key bind changes (ID: ${inputWatchID})`);
    return inputServer;
};

function Runtime() {

    logScripts();

    this.SaveState = SaveState;

    const inputServer = getInputServer();
    this.InputServer = inputServer;

    const setFrame = async (frame,parameters) => {
        if(!CanvasManager.paused) {
            CanvasManager.paused = true;
            CanvasManager.markLoading();
        }

        inputServer.managedGamepad.reset();

        const oldFrame = CanvasManager.frame;
        if(oldFrame && frame.unload) frame.unload();

        await CanvasManager.setFrame(frame,parameters);

        if(CanvasManager.paused) {
            CanvasManager.paused = false;
            CanvasManager.markLoaded();
        }
    };

    this.LoadWorld = async () => {
        await setFrame(World,[async world=>{
            await world.runScript(PRELOAD_SCRIPT);
        }]);

        if(DEV) {
            globalThis.world = CanvasManager.frame;
            globalThis.inventory = this.Inventory;
        }
    };

    this.LoadMenu = () => setFrame(MainMenu);

    const globalPreload = async () => {
        await ResourceManager.queueText(GLOBAL_PRELOAD + ".json").load();
        const manifest = ResourceManager.getText(GLOBAL_PRELOAD);
        await ResourceManager.queueManifest(manifest).load();
    };

    this.Start = async () => {
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

            if(DEMO || devSave[CLEAN_SLATE]) SaveState.hardReset();

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

        this.LoadMenu();
    };

    Object.freeze(this);
}
export default Runtime;
