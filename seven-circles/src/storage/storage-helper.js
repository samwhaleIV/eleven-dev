import SerializeHelper from "./serialize-helper.js";
import Container from "./container.js";

const LOAD_FAILURE = error => {
    console.error("Failure reading from local storage address!",error);
};
const SAVE_FAILURE = error => {
    console.error("Failure writing to to local storage address!",error);
};

const NOT_CONTAINER = Symbol("NotContainer");

const TRY_SERIALIZE = value => {
    let result = NOT_CONTAINER;
    const {IsSerializable} = SerializeHelper;
    if(IsSerializable(value)) result = value.serialize();
    return result;
};

function Save(address,source) {
    try {
        const shallowCopy = Object.assign(new Object(),source);
        Object.entries(shallowCopy).forEach(([key,value]) => {
            const result = TRY_SERIALIZE(value);
            if(result !== NOT_CONTAINER) shallowCopy[key] = result;
        });
        const storageData = JSON.stringify(shallowCopy);
        localStorage.setItem(address,storageData);
        console.log(`Saved data to '${address}'!`,storageData);
    } catch(error) {
        SAVE_FAILURE(error);
    }
}

function Deserialize(data) {
    Object.entries(data).forEach(([key,value])=>{
        if(typeof value !== "object") return;
        if(!value[SerializeHelper.DeserializeFlag]) return;
        data[key] = new Container(value);
    });
}

function Load(address,target,defaults) {
    let storageData = localStorage.getItem(address);
    if(storageData !== null) {
        try {
            storageData = JSON.parse(storageData);
        } catch(error) {
            LOAD_FAILURE(error);
        }
        Deserialize(storageData);
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
