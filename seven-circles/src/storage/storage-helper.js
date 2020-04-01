const LOAD_FAILURE = error => {
    console.error("Failure reading from local storage address!",error);
};
const SAVE_FAILURE = error => {
    console.error("Failure writing to to local storage address!",error);
};

function Save(address,source) {
    try {
        const storageData = JSON.stringify(source);
        localStorage.setItem(LOCAL_STORAGE_ADDRESS,storageData);
        console.log(`Saved data to '${address}'!`,storageData);
    } catch(error) {
        SAVE_FAILURE(error);
    }
}

function Load(address,target,defaults) {
    let storageData = localStorage.getItem(address);
    if(storageData !== null) {
        try {
            storageData = JSON.parse(storageData);
        } catch(error) {
            LOAD_FAILURE(error);
        }
    } else {
        if(!defaults) defaults = null;
        storageData = defaults;
    }
    if(storageData === null) return;
    Object.assign(target,storageData);
}

function LoadBind(address,target,defaults) {
    return Load.bind(this,address,target,defaults);
}

function SaveBind(address,source) {
    return Save.bind(this,address,source);
}

function GetSet(address,target,defaults) {
    const load = LoadBind(address,target,defaults);
    const save = SaveBind(address,target);
    return {load,save};
}

const StorageHelper = Object.freeze({Save,Load,SaveBind,LoadBind,GetSet});

export default StorageHelper;
