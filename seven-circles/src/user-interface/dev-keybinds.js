import InputCodes from "./input-codes.js";

/*
  Don't judge me, it's code for devs!
  This isn't for the light of heart.

  By using this service, you agree to let go
  of all safeties a release-ready keybind system should provide to you.

  These may, or may not include:

  1. Making sure you actually have required keys bound to something other than nothing
  2. An actual implementation of forbidden keys
  3. Code with a low-memory footprint that doesn't take the DOM and shit all over it

  If by some misfortunate 'accident' this ends up being the release version of the key bind GUI
  I'm very sorry that this has happened but I'm sure there was a good reason for it.
*/

const MENU_CLASS = "dev-key-binds";
const EDITING_CLASS = "editing";

const IS_FORBIDDEN_KEY = keyEvent => { //Short answer: No
  /*
    Did you come here to find the sacred VOID statement? There aren't many of these 'round these parts..
    Your dedication is truly inspiring.

    It's dangerous to go alone! Take this: 🍾
  */

    void keyEvent; return false; //There are things that happen here that you might not understand
};

const KEY_CODE_FORMAT = code => {
    const formattedCode = code.split(/(?=[A-Z])/).join(" ");
    return formattedCode;
};


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
        //Ignore this, this block of code is just an occupational hazard passing through
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

function DevKeyBindMenu({terminate}) {

    const menu = document.createElement("div");
    menu.className = MENU_CLASS; menu.classList.add("center");

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

        const {InputServer} = SVCC.Runtime;

        const inverseBinds = InvertBinds(binds);
        InputServer.setBinds(inverseBinds);
        InputServer.saveBinds();

        terminate();
    }));

    Object.entries(InputCodes).forEach(([displayName,inputCode])=>{
        const {entry,data} = GetKeyBindEntry(
            displayName,inputCode,binds,editingFilter
        );
        entries.push(data); menu.appendChild(entry);
    });

    return menu;
}

export default DevKeyBindMenu;
