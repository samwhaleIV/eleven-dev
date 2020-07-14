const {Grid2D,DispatchRenderer,SpriteLayer,ResourceManager} = Eleven;

import IPCCommands from "./ipc-commands.js";
import WindowDialog from "./window-dialog.js";
import InstallContainer from "./components/container-manager.js";
import InstallFileTracker from "./components/file-tracker.js";
import InstallHandjob from "./components/hand-job.js";

const TILESET = "world-tileset";
const DEFAULT_SCALE = 8;
const MIDDLE_GRAY = "#777777";

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
    "edit-cute": "cut"
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
    "KeyX": "edit-cut"
};
const NonControlCommands = {
    "Backspace": {
        command: "edit-delete",
        canRepeat: false
    }
};

function WorldEditor() {
    const dispatchRenderer = new DispatchRenderer();
    
    dispatchRenderer.addBackground((context,size)=>{
        context.fillStyle = MIDDLE_GRAY;
        context.fillRect(0,0,size.width,size.height);
    });

    const grid = new Grid2D();
    const {camera} = grid;
    camera.scale = DEFAULT_SCALE;

    grid.renderer = dispatchRenderer;
    grid.bindToFrame(this);
    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };

    this.tileset = null;

    const spriteLayer = new SpriteLayer(grid);
    dispatchRenderer.addUpdate(spriteLayer.update);
    dispatchRenderer.addRender(spriteLayer.render);

    const actions = {};
    Object.assign(this,{
        spriteLayer,dispatchRenderer,grid,camera,actions
    });

    this.load = async () => {
        this.installCommandHandlers();
        this.installKeyHandlers();

        await ResourceManager.queueImage(TILESET).load();
        this.tileset = ResourceManager.getImage(TILESET);

        InstallContainer(this);
        InstallHandjob(this);
    };

    this.undoStack = [];
    this.redoStack = [];

    InstallFileTracker(this);
}

function propertyActionProcessor(action) {
    let {object,property,newValue,value,oldValue} = action;
    if(!newValue && value) {
        action.newValue = value;
        newValue = value;
    }
    if(!oldValue) {
        action.oldValue = object.getProperty(property);
    }
    object.setProperty(property,newValue);
}
function propertyActionProcessorReverse(action) {
    const {object,property,oldValue} = action;
    object.setProperty(property,oldValue);
}

function deleteActionProcessor(action) {

}
function deleteActionProcessorReverse(action) {

}

function createActionProcessor(action) {

}
function createActionProcessorReverse(action) {

}

const actionProcessors = {
    property: {
        forward: propertyActionProcessor,
        reverse: propertyActionProcessorReverse
    },
    create: {
        forward: createActionProcessor,
        reverse: createActionProcessorReverse
    },
    delete: {
        forward: deleteActionProcessor,
        reverse: deleteActionProcessorReverse
    }
};
function getActionProcessor(type,reverse) {
    return actionProcessors[type][reverse ? "reverse" : "forward"];
}

function processAction(action,reverse) {
    const processor = getActionProcessor(action.type,reverse);
    processor(action);
}

WorldEditor.prototype.addEvents = function(actions) {
    for(const action of actions) {
        processAction(action,false);
    }
    this.undoStack.push(actions);
    this.redoStack.splice(0);
    this.unsaved = true;
};

WorldEditor.prototype.undo = function() {
    if(!this.undoStack.length) return;
    const eventStack = this.undoStack.pop();
    for(const action of eventStack) {
        processAction(action,true);
    }
    this.redoStack.push(eventStack);
    this.unsaved = true;
};

WorldEditor.prototype.redo = function() {
    if(!this.redoStack.length) return;
    const eventStack = this.redoStack.pop();
    for(const action of eventStack) {
        processAction(action,false);
    }
    this.undoStack.push(eventStack);
    this.unsaved = true;
};

WorldEditor.prototype.resetMap = function() {
    this.container.clear();
    this.container.map = null;

    this.camera.reset();
    this.camera.x = 2, this.camera.y = 2;
    this.camera.scale = DEFAULT_SCALE;
};
WorldEditor.prototype.save = async function() {
    if(!this.unsaved) return true;

    let path;
    if(!this.hasRealPath) {
        const {canceled,filePath} = await WindowDialog.saveAs();
        if(canceled) return false;
        path = filePath;
    } else {
        path = this.filePath;
    }

    const exportData = this.container.export();
    await FileSystem.writeFile(path,JSON.stringify(exportData,null,4));
    this.unsaved = false;

    return true;
};
WorldEditor.prototype.saveAs = async function() {
    const {canceled,filePath} = await WindowDialog.saveAs();
    if(canceled) return;
    this.filePath = filePath;
    this.unsaved = true;
    this.hasRealPath = true;
    await this.save();
};
WorldEditor.prototype.openFile = async function() {
    if(!(await this.fileChangeCanContinue())) return;

    const {canceled,filePath} = await WindowDialog.selectFile();
    if(canceled) return;

    const fileData = await FileSystem.readFile(filePath);
    this.filePath = filePath;
    this.unsaved = false;
    this.hasRealPath = true;

    this.resetMap();
    this.container.import(JSON.parse(fileData));
};
WorldEditor.prototype.fileChangeCanContinue = async function() {
    if(this.unsaved) {
        if(await WindowDialog.prompt("Would you like to save your unsaved changes?")) {
            const didSave = await this.save();
            if(!didSave) return false;
        }
    }
    return true;
};
WorldEditor.prototype.newFile = async function() {
    const setDefault = () => {
        this.resetMap();
        this.filePath = "Untitled.json";
        this.unsaved = false;
        this.hasRealPath = false;
    };
    if(this.filePath === null || await this.fileChangeCanContinue()) {
        setDefault();
    }
};
WorldEditor.prototype.installKeyHandlers = function() {
    const handleControl = (code,shiftKey,repeat) => {
        if(repeat) return;
        const command = ControlCommands[shiftKey ? `Shift${code}` : code];
        if(command) IPCCommands.sendCommand(command);
    };

    const handleNonControl = (code,repeat) => {
        if(!(code in NonControlCommands)) return;
        const {canRepeat,command} = NonControlCommands[code];
        if(!canRepeat && repeat) return;
        IPCCommands.sendCommand(command);
    };

    this.keyDown = ({code,repeat,ctrlKey,shiftKey,altKey}) => {
        if(ctrlKey) {
            if(altKey) return;
            handleControl(code,shiftKey,repeat);
            return;
        }
        if(altKey || shiftKey) return;
        handleNonControl(code,repeat);
    };
};
WorldEditor.prototype.installCommandHandlers = function() {
    for(const [command,target] of Object.entries(CommandRouting)) {
        IPCCommands.setHandler(command,this[target].bind(this));
    }
};
WorldEditor.prototype.setAction = function(name,handler) {
    this.actions[name] = handler;
};
WorldEditor.prototype.sendAction = function(name) {
    const action = this.actions[name];
    if(action) action();
};

WorldEditor.prototype.selectAll = function() {this.sendAction("selectAll")};
WorldEditor.prototype.deleteSelection = function() {this.sendAction("deleteSelection")};

WorldEditor.prototype.paste = function() {this.sendAction("paste")};
WorldEditor.prototype.copy = function() {this.sendAction("copy")};
WorldEditor.prototype.cut = function() {this.sendAction("cut")};

export default WorldEditor;
