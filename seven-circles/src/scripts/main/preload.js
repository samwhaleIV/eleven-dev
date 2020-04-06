import Lifetime from "../helper/lifetime.js";
import Constants from "../../constants.js";

const PRELOAD_FILES = Constants.WorldPreloadFile;

const {ResourceManager} = Eleven;

function Preload(world) {
    this.load = async () => {
        ResourceManager.queueText(PRELOAD_FILES + ".json");
        await ResourceManager.load();

        ResourceManager.queueManifest(
            ResourceManager.getText(PRELOAD_FILES)
        );
        await ResourceManager.load();
    
        const {script,parameters} = Lifetime.getStartScript();
        await world.runScript(script,...parameters);
    };
}
export default Preload;
