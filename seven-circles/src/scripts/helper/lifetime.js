import SaveState from "../../storage/save-state.js";

const POSITION_CONTAINER = "PlayerPosition";

const NO_SCRIPT_HANDLE = "_none";

const POSITION_DEFAULTS = Object.freeze({
    x: 0, y: 0, direction: 0, scriptID: null
});

const getPositionContainer = () => {
    const container = SaveState.getContainer(POSITION_CONTAINER,POSITION_DEFAULTS);
    return container.data;
};

const getWorldScript = player => {
    const {world} = player; if(!world) return NO_SCRIPT_HANDLE;
    const {script} = world; if(!script) return NO_SCRIPT_HANDLE;
    switch(typeof script) {
        case "object": return script.constructor.name;
        case "function": return script.name;
        default: return NO_SCRIPT_HANDLE;
    }
};

const storePosition = (player,scriptID) => {
    const container = getPositionContainer();
    container.x = player.x; container.y = player.y;
    container.direction = player.direction;
    container.scriptID = scriptID || getWorldScript(player);
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

const Lifetime = Object.freeze({
    storePosition,loadPosition,hasPosition,
    clearPosition,resetPosition,resumePosition,
    save: SaveState.save, load: SaveState.load
});

export default Lifetime;
