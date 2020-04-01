const scripts = new Object();

function Import(...scripts) {
    for(let i = 0;i<scripts.length;i++) {
        const script = scripts[i];
        scripts[script.name] = script;
    }
}

const NO_SCRIPT_FOUND = ID => {
    console.warn(`Warning: Script ${ID} not loaded into script book!`);
};

function Get(ID) {
    if(ID in scripts) return scripts[ID];

    NO_SCRIPT_FOUND(ID); return null;
}

const ScriptBook = Object.freeze({
    Import, Get
});

export default ScriptBook;
