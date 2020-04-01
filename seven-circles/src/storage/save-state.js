import StorageHelper from "./storage-helper.js";
import DefaultSaveState from "./default-save-state.js";

const LOCAL_STORAGE_ADDRESS = "SVCC_SAVE_STATE_DATA";

const DANGER_DANGER_HIGH_VOLTAGE = () => {
    console.warn("Notice: Hard resets are not intended to be performed programmatically!");
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

    this.delete = key => {
        return delete state[key];
    };

    Object.freeze(this);
}

export default SaveState;
