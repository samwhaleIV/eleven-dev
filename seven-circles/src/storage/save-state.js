import StorageHelper from "./storage-helper.js";
import DefaultSaveState from "./default-save-state.js";
import Container from "./container.js";
import SerializeHelper from "./serialize-helper.js";
import Constants from "../constants.js";

const LOCAL_STORAGE_ADDRESS = Constants.SaveStateAddress;

const DANGER_DANGER_HIGH_VOLTAGE = () => {
    console.warn("Notice: Hard resets are not intended to be performed programmatically!");
};

const NOT_CONTAINER_TYPE = key => {
    throw Error(`Save state for key '${key}' is not a container`);
};

function SaveState() {

    const state = new Object();

    const {save,load} = StorageHelper.GetSet(
        LOCAL_STORAGE_ADDRESS,state,DefaultSaveState
    );

    this.save = save; this.load = load;

    const reset = () => {
        Object.keys(state).forEach(key=>{
            delete state[key];
        });
        Object.assign(state,DefaultSaveState);
    };
    this.reset = reset;
    this.hardReset = () => {
        DANGER_DANGER_HIGH_VOLTAGE();
        reset(); save();
    };

    this.set = (key,value) => {
        state[key] = value;
        return value;
    };
    this.get = key => {
        let data = state[key];
        if(data === undefined) data = null;
        return data;
    };
    this.has = key => {
        return key in state;
    };
    this.delete = key => {
        return delete state[key];
    };

    this.getContainer = (key,defaults) => {
        let container = this.get(key);
        if(!container) {
            container = new Container(defaults);
            state[key] = container;
        } else {
            if(!SerializeHelper.IsSerializable(container)) NOT_CONTAINER_TYPE(key);
        }
        return container;
    };

    Object.freeze(this);
}

export default new SaveState();
