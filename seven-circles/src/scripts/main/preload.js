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

const GetStartScript = parameters => {
    //TODO: Use lifetime logic. Delete parameters if invalid for script
    let parametersValid = true;
    if(!parametersValid) parameters.splice(0);
    return Scripts[GAME_START_SCRIPT];
};

function Preload(world,...parameters) {
    this.load = async () => {
        ResourceManager.queueManifest(PRELOAD_RESOURCES);
        ResourceManager.load();
    
        const startScript = GetStartScript(parameters);

        //Pass the parameters through...
        await world.runScript(startScript,...parameters);
    };
}
export default Preload;
