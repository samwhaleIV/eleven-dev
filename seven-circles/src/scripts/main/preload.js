import Scripts from "../manifest.js";
import Constants from "../../constants.js";

const GAME_START_SCRIPT = Constants.GameStartScript;

const {ResourceManager} = Eleven;

const PRELOAD_RESOURCES = `{
    "Image": [
        "player-gun.png",
        "enemy-gun.png",
        "other.png"
    ]
}`;

const GetStartScript = () => {
    //TODO: Use lifetime nonsense...
    return Scripts[GAME_START_SCRIPT];
};

function Preload(world) {
    this.load = async () => {
        ResourceManager.queueManifest(PRELOAD_RESOURCES);
        ResourceManager.load();
    
        const startScript = GetStartScript();
        await world.runScript(startScript);
    };
}
export default Preload;
