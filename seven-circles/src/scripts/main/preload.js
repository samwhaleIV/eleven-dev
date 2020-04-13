import Lifetime from "../helper/lifetime.js";
import Constants from "../../constants.js";

const PRELOAD_FILES = Constants.WorldPreloadFile;

const {ResourceManager} = Eleven;

function Preload({world}) {
    this.load = async () => {
        ResourceManager.queueText(PRELOAD_FILES + ".json");
        await ResourceManager.load();

        ResourceManager.queueManifest(
            ResourceManager.getText(PRELOAD_FILES)
        );
        await ResourceManager.load();
    
        const {script,data} = Lifetime.getStartScript();
        data.fromPreload = true;

        await world.runScript(script,data,true);
    };
}
export default Preload;
