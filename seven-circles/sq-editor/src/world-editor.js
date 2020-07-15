const {Grid2D,DispatchRenderer,SpriteLayer,ResourceManager} = Eleven;

import IPCCommands from "./ipc-commands.js";
import WindowDialog from "./window-dialog.js";
import InstallContainer from "./components/container-manager.js";
import InstallFileTracker from "./components/file-tracker.js";
import InstallHandjob from "./components/hand-job.js";
import GetObject from "../../src/sequence/objects.js";
import {DecoratorList} from "../../src/dynamic-map/decorators.js";
import InstallPropertyEditor from "./components/property-editor.js";
import InstallObjectBrowser from "./components/object-browser.js";

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
    "edit-cut": "cut",

    "set-map": "selectMapImage",
    "cycle-decorator": "cycleDecorator",

    "toggle-browser": "toggleBrowser",
    "exit-browser": "exitBrowser"
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
    },
    "KeyD": {
        command: "cycle-decorator",
        canRepeat: false
    },
    "KeyM": {
        command: "set-map",
        canRepeat: false
    },
    "KeyO": {
        command: "toggle-browser",
        canRepeat: false
    },
    "Escape": {
        command: "exit-browser",
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

        InstallContainer(this); InstallHandjob(this);
        InstallPropertyEditor(this); InstallObjectBrowser(this);
    };

    this.undoStack = [];
    this.redoStack = [];

    InstallFileTracker(this);
}

function propertyActionProcessor(action) {
    let {objectID,property,newValue,value,oldValue} = action;
    const object = this.container.getObject(objectID);
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
    const {objectID,property,oldValue} = action;
    const object = this.container.getObject(objectID);
    object.setProperty(property,oldValue);
}

function deleteActionProcessor(action) {
    const {objectID} = action;
    const object = this.container.getObject(objectID);
    const serialData = object.serialize();
    action.serialData = serialData;
    action.objectType = object.type;
    object.delete();
}
function deleteActionProcessorReverse(action) {
    const {objectID,objectType,serialData} = action;
    const object = GetObject(this.container,objectType,objectID);
    object.create(serialData);
}

function createActionProcessor(action) {
    const {serialData,objectType} = action;
    const objectID = this.container.IDCounter++;
    action.objectID = objectID;
    const object = GetObject(this.container,objectType,objectID);
    object.create(serialData);
}
function createActionProcessorReverse(action) {
    const {objectID} = action;
    const object = this.container.getObject(objectID);
    object.delete();
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

WorldEditor.prototype.processAction = function(action,reverse) {
    const processor = getActionProcessor(action.type,reverse);
    const {object} = action;
    if(object) {
        action.objectID = object.ID;
        delete action.object;
    }
    processor.call(this,action);
}

WorldEditor.prototype.addEvents = function(actions) {
    if(!actions.length) return;
    for(const action of actions) {
        this.processAction(action,false);
    }
    this.undoStack.push(actions);
    this.redoStack.splice(0);
    this.unsaved = true;
};

WorldEditor.prototype.undo = function() {
    if(!this.undoStack.length) return;
    const eventStack = this.undoStack.pop();
    for(const action of eventStack) {
        this.processAction(action,true);
    }
    this.redoStack.push(eventStack);
    this.unsaved = true;
};

WorldEditor.prototype.redo = function() {
    if(!this.redoStack.length) return;
    const eventStack = this.redoStack.pop();
    for(const action of eventStack) {
        this.processAction(action,false);
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
    if(!this.unsaved) {
        if(!this.hasRealPath) {
            return this.saveAs();
        } else {
            return true;
        }
    }

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
    if(canceled) return false;
    this.filePath = filePath;
    this.unsaved = true;
    this.hasRealPath = true;
    return await this.save();
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
        if(await WindowDialog.prompt("Would you like to save your changes?")) {
            const didSave = await this.save();
            if(!didSave) return false;
        }
    }
    return true;
};
WorldEditor.prototype.newFile = async function() {
    const setDefault = async () => {
        this.resetMap();
        this.filePath = "Untitled.json";
        this.unsaved = false;
        this.hasRealPath = false;
        if(!this.container.map) {
            await this.selectMapImage();
        }
    };
    if(this.filePath === null || await this.fileChangeCanContinue()) {
        await setDefault();
    }
};
WorldEditor.prototype.installKeyHandlers = function() {
    const handleControl = (code,shiftKey,repeat) => {
        const command = ControlCommands[shiftKey ? `Shift${code}` : code];
        if(repeat && !(
            command === "edit-undo" || command === "edit-redo"
        )) return;
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

WorldEditor.prototype.toggleBrowser = function(){this.sendAction("toggle-browser")};
WorldEditor.prototype.exitBrowser = function(){this.sendAction("exit-browser")};

WorldEditor.prototype.cycleDecorator = function() {
    const {container} = this;
    const currentDecorator = container.decorator || "none";

    let index = DecoratorList.indexOf(currentDecorator);
    if(index < 0) {
        index = 0;
    } else {
        index += 1;
    }
    if(index >= currentDecorator.length) index = 0;

    container.decorator = DecoratorList[index];
    this.unsaved = true;
};
WorldEditor.prototype.selectMapImage = async function() {
    if(!this.filePath) {
        await this.newFile();
        return;
    }
    const {canceled,filePath} = await WindowDialog.selectMapImage();
    if(canceled) return;
    if(!filePath.startsWith(FileSystem.mapImageFolder)) {
        await WindowDialog.alert("Map image must be located in 'resources/images/maps' folder!");
        return;
    }
    const mapName = FileSystem.baseName(filePath,".png");
    this.container.map = mapName;

    this.unsaved = true;
};

export default WorldEditor;
