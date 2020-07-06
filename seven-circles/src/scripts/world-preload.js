import Constants from "../constants.js";
import Lifetime from "./lifetime.js";

const PRELOAD_FILES = Constants.WorldPreloadFile;
const SOUND_EFFECTS_TABLE = "sound-effects";

const {ResourceManager} = Eleven;

async function WorldPreload(world) {
    world.suggestedSongs = world.getSuggestedSongs();

    ResourceManager.queueText(PRELOAD_FILES + ".json");

    await ResourceManager.load();

    const soundEffectsTable = ResourceManager.getJSON(SOUND_EFFECTS_TABLE);
    const soundEffectsTarget = world.soundEffects;

    for(const [key,entry] of Object.entries(soundEffectsTable)) {
        if(entry === null) {
            soundEffectsTarget[key] = null;
            delete soundEffectsTable[key];
            continue;
        }
        ResourceManager.queueAudio(entry);
    }

    ResourceManager.queueManifest(
        ResourceManager.getText(PRELOAD_FILES)
    );
    await ResourceManager.load();

    for(const [key,entry] of Object.entries(soundEffectsTable)) {
        const baseFile = ResourceManager.getLookupName(entry);
        const resource = ResourceManager.getAudio(baseFile);
        if(resource) {
            soundEffectsTarget[key] = resource;
        } else {
            soundEffectsTarget[key] = undefined;
        }
    }

    const {script,data} = Lifetime.getStartScript();
    Object.assign(data,{
        fromPreload: true,
        lastScript: "Preload"
    });

    await world.setLevel(script,data);
}
export default WorldPreload;
