const CommandRouting = {
    "file-save": "save",
    "file-save-as": "saveAs",
    "file-open": "openFile",
    "file-new": "newFile",

    "edit-undo": "undo",
    "edit-redo": "redo",

    "edit-select-all": "selectAll",
    "edit-delete": "deleteSelection",

    "edit-copy": "copy",
    "edit-paste": "paste",
    "edit-cut": "cut",

    "set-map": "selectMapImage",
    "cycle-decorator": "cycleDecorator",

    "toggle-browser": "toggleBrowser",
    "exit-browser": "exitBrowser",
    "grid-toggle": "toggleGrid",

    "grid-shrink": "shrinkGrid",
    "grid-grow": "growGrid",
    "reload-map": "reloadMap"
};

const ControlCommands = {
    "KeyO": "file-open",
    "KeyN": "file-new",
    "KeyS": "file-save",
    "ShiftKeyS": "file-save-as",

    "KeyZ": "edit-undo",
    "KeyR": "edit-redo",

    "KeyA": "edit-select-all",

    "KeyC": "edit-copy",
    "KeyV": "edit-paste",
    "KeyX": "edit-cut",
    "KeyM": "set-map"
};

const NonControlCommands = {
    "Backspace": {
        command: "edit-delete",
        canRepeat: false
    },
    "KeyD": {
        command: "cycle-decorator",
        canRepeat: false
    },
    "KeyM": {
        command: "reload-map",
        canRepeat: false
    },
    "KeyO": {
        command: "toggle-browser",
        canRepeat: false
    },
    "Escape": {
        command: "exit-browser",
        canRepeat: false
    },
    "KeyG": {
        command: "grid-toggle",
        canRepeat: false
    },
    "Equal": {
        command: "grid-grow",
        canRepeat: true
    },
    "Minus": {
        command: "grid-shrink",
        canRepeat: true
    }
};

const PassthroughActions = [
    "selectAll","deleteSelection","paste",
    "cut","copy","toggleBrowser",
    "exitBrowser"
];

export {
    NonControlCommands,
    CommandRouting,
    ControlCommands,
    PassthroughActions
};
