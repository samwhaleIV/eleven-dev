import Constants from "../constants.js";
import Lifetime from "./lifetime.js";
const PRELOAD_FILES = Constants.WorldPreloadFile;

const {ResourceManager} = Eleven;

async function WorldPreload(world) {
    world.suggestedSongs = world.getSuggestedSongs();

    ResourceManager.queueText(PRELOAD_FILES + ".json");
    await ResourceManager.load();

    ResourceManager.queueManifest(
        ResourceManager.getText(PRELOAD_FILES)
    );
    await ResourceManager.load();

    const {script,data} = Lifetime.getStartScript();
    Object.assign(data,{
        fromPreload: true,
        lastScript: "Preload"
    });

    await world.setLevel(script,data);
}
export default WorldPreload;
