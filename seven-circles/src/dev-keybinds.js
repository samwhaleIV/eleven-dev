import InputCodes from "./user-interface/input-codes.js";

const MENU_CLASS = "dev-key-binds";
const EDITING_CLASS = "editing";

let menuShown = false;

const {CanvasManager} = Eleven;

let frameTargetOverride = null;

const IS_FORBIDDEN_KEY = keyEvent => {
    return false;
};

const KEY_CODE_FORMAT = code => {
    const formattedCode = code.split(/(?=[A-Z])/).join(" ");
    console.log(formattedCode);
    return formattedCode;
};

function TryAssistFrameInThisWeirdTransition() {
    const {frame} = CanvasManager;
    if(frame) {
        const target = frame.getDeepest();
        frameTargetOverride = target;
        target.child = {render:()=>{}};
        if(frame.refreshInput) frame.refreshInput();
    }
}
function ResumeFrame() {
    if(frameTargetOverride) {
        frameTargetOverride.child = null;
        frameTargetOverride = null;
        const {frame} = CanvasManager;
        if(frame.refreshInput) frame.refreshInput();
    }
}

function GetExitButton(callback) {
    const button = document.createElement("div");
    button.className = "button";
    button.onclick = callback;
    const text = document.createElement("p");
    text.appendChild(document.createTextNode("Close Menu"));
    button.appendChild(text);
    return button;
}

function GetKeyBindEntry(displayName,inputCode,binds,editingFilter) {
    const data = {editing:false};
    const currentValue = binds[inputCode];

    const entry = document.createElement("div");
    
    const display = document.createElement("p");
    display.appendChild(document.createTextNode(displayName));
    entry.appendChild(display);

    const value = document.createElement("p");

    const setValueKeyCode = code => {
        value.innerText = KEY_CODE_FORMAT(code);
    };

    if(currentValue) {
        setValueKeyCode(currentValue);
    }

    entry.appendChild(value);

    entry.onclick = () => {
        if(!editingFilter()) return;
        data.editing = true;
        entry.classList.add(EDITING_CLASS);
        value.innerText = "Press key...";
        const listener = function(event) {
            if(IS_FORBIDDEN_KEY(event)) return;
            const {code} = event;
            binds[inputCode] = code;
            setValueKeyCode(code);
            window.removeEventListener("keydown",listener);
            entry.classList.remove(EDITING_CLASS);
            data.editing = false;
        };
        window.addEventListener("keydown",listener);
    }

    return {entry,data};
}

function InvertBinds(binds) {
    const buffer = new Object();
    Object.entries(binds).forEach(([key,value])=>{
        buffer[value] = key;
    });
    return buffer;
}

function GetInvertBinds() {
    return InvertBinds(SVCC.Runtime.InputServer.getBinds());
}

function ShowDevKeyBindMenu() {
    if(menuShown) return "Menu already active!";
    menuShown = true;
    TryAssistFrameInThisWeirdTransition();

    const menu = document.createElement("div");
    menu.className = MENU_CLASS;

    const binds = GetInvertBinds();

    const entries = [];

    const editingFilter = () => {
        for(let i = 0;i<entries.length;i++) {
            if(entries[i].editing) return false;
        }
        return true;
    };

    menu.appendChild(GetExitButton(()=>{
        if(!editingFilter()) return;

        const inverseBinds = InvertBinds(binds);
        SVCC.Runtime.InputServer.setBinds(inverseBinds);

        SVCC.Runtime.InputServer.saveBinds();
        document.body.removeChild(menu);
        ResumeFrame();
        menuShown = false;
    }));

    Object.entries(InputCodes).forEach(([displayName,inputCode])=>{
        const {entry,data} = GetKeyBindEntry(
            displayName,inputCode,binds,editingFilter
        );
        entries.push(data); menu.appendChild(entry);
    });

    document.body.appendChild(menu);

    return "Menu opened...";
}
export default ShowDevKeyBindMenu;
