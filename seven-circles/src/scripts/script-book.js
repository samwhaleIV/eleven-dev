/* This file is coupled to "./manifest.js", a dynamically linked import list */

const NO_SCRIPT_FOUND = ID => {
    console.warn(`Warning: Script ${ID} not loaded into script book!`);
};

const scripts = new Object();

function Import(...scriptList) {
    const localScripts = new Object();
    for(let i = 0;i<scriptList.length;i++) {
        const script = scriptList[i];
        localScripts[script.name] = script;
    }
    Object.assign(scripts,localScripts);
    return localScripts;
}

function Get(ID) {
    if(ID in scripts) return scripts[ID];

    NO_SCRIPT_FOUND(ID); return null;
}

const ScriptBook = Object.freeze({Import,Get});

export default ScriptBook;
