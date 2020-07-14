const {Grid2D,DispatchRenderer,SpriteLayer} = Eleven;
import IPCCommands from "./ipc-commands.js";
import SQContainer from "../../src/sequence/sq-container.js";

const CommandRouting = {
    "file-save": "save",
    "file-save-as": "saveAs",
    "file-open": "openFile",
    "file-new": "newFile",

    "edit-undo": "undo",
    "edit-redo": "redo",
    "edit-select-all": "selectAll",
    "edit-delete": "deleteSelection"
};

const ControlCommands = {
    "KeyO": "file-open",
    "KeyN": "file-new",
    "KeyS": "file-save",
    "ShiftKeyS": "file-save-as",

    "KeyZ": "edit-undo",
    "KeyR": "edit-redo",
    "KeyA": "edit-select-all"
};
const NonControlCommands = {
    "Backspace": {
        command: "edit-delete",
        canRepeat: false
    }
};

function WorldEditor() {

    const dispatchRenderer = new DispatchRenderer();
    const grid = new Grid2D();

    grid.renderer = dispatchRenderer;
    grid.bindToFrame(this);

    const spriteLayer = new SpriteLayer(grid);
    dispatchRenderer.addUpdate(spriteLayer.update);
    dispatchRenderer.addRender(spriteLayer.render);

    Object.assign(this,{spriteLayer,dispatchRenderer,grid});

    this.load = () => {
        this.installCommandHandlers();
        this.installKeyHandlers();

        this.container = new SQContainer(this,true);
    };
}

WorldEditor.prototype.save = function() {
    console.log("Save");
};
WorldEditor.prototype.saveAs = function() {
    console.log("Save as");
};
WorldEditor.prototype.undo = function() {
    console.log("Undo");
};
WorldEditor.prototype.redo = function() {
    console.log("Redo");
};
WorldEditor.prototype.openFile = function() {
    console.log("Open file");
};
WorldEditor.prototype.newFile = function() {
    console.log("New file");
};
WorldEditor.prototype.selectAll = function() {
    console.log("Select all");
};
WorldEditor.prototype.deleteSelection = function() {
    console.log("Delete selection");
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
export default WorldEditor;
