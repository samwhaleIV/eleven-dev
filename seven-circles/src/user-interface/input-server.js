import StorageHelper from "../storage/storage-helper.js";
import InputCodes from "./input-codes.js";
import Constants from "../constants.js";

const LOCAL_STORAGE_ADDRESS = Constants.KeyBindAddress;
const {KeyBind, ManagedGamepad} = Eleven;
const {Up, Down, Left, Right, Click, Exit, Inventory} = InputCodes;

const DEFAULT_BINDS = {
    "KeyW": Up,
    "KeyS": Down,
    "KeyA": Left,
    "KeyD": Right,
    "Enter": Click,
    "Escape": Exit,
    "KeyE": Inventory
};

function GetManagedGamepad() {
    const managedGamepad = new ManagedGamepad({
        binds: {
            Up: Up,
            Down: Down,
            Left: Left,
            Right: Right,
            ButtonA: Click,
            ButtonB: Exit,
            ButtonX: Inventory
        },
        whitelist: true,
        triggerThreshold: 0.1,
        repeatButtons: false,
        repeatAxes: false,
        repeatTriggers: false,
        repeatDelay: 200,
        repeatRate: 150,
        axisDeadzone: 0.7,
        manageLeftAxis: true,
        manageRightAxis: false,
        compositeLeftAxis: true,
        compositeRightAxis: false
    });
    return managedGamepad;
}

function FlipFlop(target) {
    //Remove duplicate values that might exist in the target, use as the last key of that value as the ultimate value
    //For example: {a:1,b:1,c:1} The key that is used is 'c', and 'a' and 'b' are removed from the target.
    const buffer = new Object();
    Object.entries(target).forEach(([key,value])=>{
        buffer[value] = key; delete target[key];
    });
    Object.entries(buffer).forEach(([value,key])=>{
        target[key] = value;
    });
}

function InputServer() {

    const keyBindSource = new Object();

    const {load,save} = StorageHelper.GetSet(
        LOCAL_STORAGE_ADDRESS,keyBindSource,DEFAULT_BINDS
    );

    this.saveBinds = save;

    let listenerID = 1;
    const listeners = new Object();

    const fireChangeEvent = () => {
        Object.values(listeners).forEach(listener=>listener());
    };

    const clearKeys = () => {
        Object.keys(keyBindSource).forEach(key=>{
            delete keyBindSource[key];
        });
    };

    const cleanDuplicates = FlipFlop.bind(null,keyBindSource);

    const setBind = (value,code,clean=true) => {
        delete keyBindSource[value];
        keyBindSource[value] = code;
        if(clean) cleanDuplicates();
        fireChangeEvent();
    };

    this.setBind = setBind;

    this.setBinds = (keyBindSet,clean=true) => {
        clearKeys();
        if(!Array.isArray(keyBindSet)) {
            keyBindSet = Object.entries(keyBindSet);
        }
        keyBindSet.forEach(([keyCode,inputCode])=>{
            setBind(keyCode,inputCode,false);
        });
        if(clean) cleanDuplicates();
        fireChangeEvent();
    };

    this.resetBinds = () => {
        clearKeys();
        Object.assign(keyBindSource,DEFAULT_BINDS);
        fireChangeEvent();
    };

    this.clearBinds = () => {
        clearKeys();
        fireChangeEvent();
    };

    const keyBind = new KeyBind(keyBindSource);

    this.codes = InputCodes;
    this.keyBind = keyBind;

    const managedGamepad = GetManagedGamepad();
    this.managedGamepad = managedGamepad;

    const getShallowCopy = () => {
        return Object.assign(new Object(),keyBindSource);
    };

    this.getBinds = getShallowCopy;

    this.addChangeListener = listener => {
        const ID = listenerID;
        listenerID += 1;
        listeners[ID] = listener;
        return ID;
    };
    this.removeChangeListener = ID => {
        return delete listeners[ID];
    };

    Object.freeze(this);

    load();
}

export default InputServer;
