import SaveState from "../storage/save-state.js";
import Scripts from "./manifest.js";
import Constants from "../constants.js";

const POSITION_CONTAINER = "PlayerPosition";
const NO_SCRIPT_HANDLE = "_none";
const GAME_START_SCRIPT = Constants.GameStartScript;

const POSITION_DEFAULTS = Object.freeze({
    x: 0, y: 0, direction: 0, scriptID: NO_SCRIPT_HANDLE
});

const getPositionContainer = () => {
    const container = SaveState.getContainer(POSITION_CONTAINER,POSITION_DEFAULTS);
    return container.data;
};

const trySerialize = (script,container) => {
    if(!container || !script.serialize) return;
    container.serializeData = script.serialize();
};

const getWorldScript = (player,serializeContainer) => {
    const {world} = player; if(!world) return NO_SCRIPT_HANDLE;
    const {script} = world; if(!script) return NO_SCRIPT_HANDLE;
    switch(typeof script) {
        case "object":
            trySerialize(script,serializeContainer);
            return script.constructor.name;
        case "function": return script.name;
        default: return NO_SCRIPT_HANDLE;
    }
};

const getStartScript = () => {
    let script = GAME_START_SCRIPT;
    const data = new Object();

    const {scriptID,serializeData} = getPositionContainer();
    if(scriptID in Scripts) {
        script = scriptID;
        if(serializeData) {
            data.serializeData = serializeData;
        }
    }

    return {script:Scripts[script],data};
};

const serialize = (player,scriptID) => {
    const container = getPositionContainer();

    const {x,y,direction} = player;

    container.x = x; container.y = y;
    container.direction = direction;

    if(!scriptID) scriptID = getWorldScript(player,container);
    container.scriptID = scriptID;
};
const assignContainer = (container,player) => {
    player.x = container.x; player.y = container.y;
    player.direction = container.direction;
};
const loadPosition = player => {
    const container = getPositionContainer();
    assignContainer(container,player);
};
const hasPosition = () => {
    return SaveState.has(POSITION_CONTAINER);
};
const clearPosition = () => {
    return SaveState.delete(POSITION_CONTAINER);
};
const resetPosition = () => {
    const container = getPositionContainer();
    container.restore(POSITION_DEFAULTS);
};

const scriptsEqual = (a,b) => {
    if(a === NO_SCRIPT_HANDLE || b === NO_SCRIPT_HANDLE) return false;
    return a === b;
};

const resumePosition = (player,defaults,scriptID) => {
    const container = getPositionContainer();

    if(!scriptID) scriptID = getWorldScript(player);
    const sourceScriptID = container.scriptID;

    if(scriptsEqual(sourceScriptID,scriptID)) {
        assignContainer(container,player); 
    } else {
        if(defaults) assignContainer(defaults,player); 
    }
};
const setPosition = (player,values) => {
    assignContainer(values,player);
};

const save = SaveState.save;
const load = SaveState.load;
const getContainer = SaveState.getContainer;

const hardSerialize = (player,scriptID) => {
    serialize(player,scriptID); save();
};

const Lifetime = Object.freeze({
    serialize,loadPosition,hasPosition,setPosition,
    clearPosition,resetPosition,resumePosition,getStartScript,
    getContainer,save,load,hardSerialize
});

export default Lifetime;
