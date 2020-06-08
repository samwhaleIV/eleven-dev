const INPUT = 0;
const KEY_DOWN = 1;
const KEY_UP = 2;
const KEY_DOWN_GAMEPAD = 3;
const KEY_UP_GAMEPAD = 4;
const INPUT_GAMEPAD = 5;

const INPUT_ROUTES = [
    [INPUT,"input"],
    [KEY_DOWN,"keyDown"],
    [KEY_UP,"keyUp"],
    [KEY_DOWN_GAMEPAD,"managedGamepad.keyDown"],
    [KEY_UP_GAMEPAD,"managedGamepad.keyUp"],
    [INPUT_GAMEPAD,"managedGamepad.inputGamepad"]
].reduce((set,[ID,address])=>{
    set[ID] = address.split(".");
    return set;
},new Array());

const IMPULSE = 1, POLL = 2;
const KEY_BINDABLE = Object.freeze({
    [INPUT]: POLL,
    [KEY_DOWN]: IMPULSE,
    [KEY_UP]: IMPULSE
});

const EXTERNAL_INPUT_ROUTES = [
    [INPUT,"input"],
    [KEY_DOWN,"keyDown"],
    [KEY_UP,"keyUp"],
    [KEY_DOWN_GAMEPAD,"keyDownGamepad"],
    [KEY_UP_GAMEPAD,"keyUpGamepad"],
    [INPUT_GAMEPAD,"inputGamepad"]
];

function getRouteValue(root,route) {
    for(let i = 0;i<route.length;i++) {
        root = root[route[i]];
    }
    return root || null;
}
function setRouteValue(root,route,value) {
    const routeEnd = route.length - 1;
    for(let i = 0;i<routeEnd;i++) {
        root = root[route[i]];
    }
    root[route[routeEnd]] = value;
}

function saveInputs(world,target) {
    INPUT_ROUTES.forEach((route,ID)=>target[ID]=getRouteValue(world,route));
}
function restoreInputs(world,source) {
    INPUT_ROUTES.forEach((route,ID)=>setRouteValue(world,route,source[ID]));
}
function clearInputs(world) {
    INPUT_ROUTES.forEach(route=>setRouteValue(world,route,null));
}

function tryApplyInputSettings(settings) {
    const {proxyBase} = settings;
    const proxySettings = {
        sendToBase: settings.sendToBase,
        boundKeyboard: settings.boundKeyboard
    };
    if(settings.mirroredGamepad) {
        const {input,keyDown,keyUp} = settings;
        if(input) settings.inputGamepad = input;
        if(keyDown) settings.keyDownGamepad = keyDown;
        if(keyUp) settings.keyUpGamepad = keyUp;
    }
    for(let i = 0;i<EXTERNAL_INPUT_ROUTES.length;i++) {
        const [inputID,namedInput] = EXTERNAL_INPUT_ROUTES[i];
        if(!(namedInput in settings)) continue;
        proxyBase(inputID,settings[namedInput],proxySettings);
    }
}

function InputProxy(world,settings={}) {
    settings = Object.assign({cleanOnOpen:false},settings);

    const baseInputs = [];

    let closed = false;

    saveInputs(world,baseInputs);
    if(settings.cleanOnOpen) clearInputs(world);

    this.close = () => {
        if(closed) return;
        restoreInputs(world,baseInputs);
        closed = true;
    };

    const {keyBind} = SVCC.Runtime.InputServer;

    const proxyBase = (inputID,method,{sendToBase,boundKeyboard}) => {
        let target = null;
        if(typeof method === "function") {
            if(sendToBase) {
                const baseMethod = baseInputs[inputID];
                target = baseMethod ? data => {
                    baseMethod(data);
                    method(data);
                } : method;
            } else {
                target = method;
            }
        }
        
        if(target !== null && boundKeyboard && inputID in KEY_BINDABLE) {
            const code = KEY_BINDABLE[inputID];
            if(code === IMPULSE) {
                target = keyBind.impulse(target);
            } else if(code === POLL) {
                target = keyBind.poll(target);
            }
        }

        setRouteValue(world,INPUT_ROUTES[inputID],target);
    };
    const getProxy = inputID => proxyBase.bind(this,inputID);

    this.setInput = getProxy(INPUT);
    this.setKeyDown = getProxy(KEY_DOWN);
    this.setKeyUp = getProxy(KEY_UP);

    this.setInputGamepad = getProxy(INPUT_GAMEPAD);
    this.setKeyDownGamepad = getProxy(KEY_DOWN_GAMEPAD);
    this.setKeyUpGamepad = getProxy(KEY_UP_GAMEPAD);

    const packagedInputSet = settings => tryApplyInputSettings.call(
        this,Object.assign({proxyBase},settings)
    );
    this.set = settings => packagedInputSet(settings);
    packagedInputSet(settings);
}

function getInputProxy(settings) {
    return new InputProxy(this,settings);
}

export default {getInputProxy}
