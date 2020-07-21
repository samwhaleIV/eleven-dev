const {Grid2D,DispatchRenderer,SpriteLayer,ResourceManager} = Eleven;

import {
    ControlCommands,
    NonControlCommands,
    CommandRouting,
    PassthroughActions
} from "./commands-list.js";

import {DecoratorList} from "../../src/dynamic-map/decorators.js";

import IPCCommands from "./remote/ipc-commands.js";

import InstallContainer from "./components/container-manager.js";
import InstallFileTracker from "./components/file-tracker.js";

import InstallHandjob from "./components/hand-job.js";
import InstallPropertyEditor from "./components/property-editor.js";
import InstallObjectBrowser from "./components/object-browser.js";

import AddFileActions from "./components/file-actions.js";
import AddEventProcessing from "./components/event-processing.js";

import InstallGridView from "./components/grid-view.js";

const TILESET = "world-tileset";
const DEFAULT_SCALE = 8;
const MIDDLE_GRAY = "#777777";

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

    this.undoStack = [], this.redoStack = [];

    InstallFileTracker(this);
    InstallGridView(this);

    this.onDoubleClick = () => {
        this.sendAction("toggleBrowser");
    }
}

WorldEditor.prototype.resetMap = function() {
    this.container.clear();

    this.undoStack.splice(0);
    this.redoStack.splice(0);

    this.container.map = null;

    if(this.clearSelection) {
        this.clearSelection();
    }

    this.camera.reset();
    this.camera.x = 2, this.camera.y = 2;
    this.camera.scale = DEFAULT_SCALE;
};
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
WorldEditor.prototype.toggleGrid = function() {
    if(this.gridToggler) {
        this.gridToggler();
    }
};
WorldEditor.prototype.growGrid = function() {
    this.gridScale *= 2;
};
WorldEditor.prototype.shrinkGrid = function() {
    this.gridScale /= 2;
};
WorldEditor.prototype.reloadMap = function() {
    const {container} = this;
    if(!container) return;
    const {map} = container;
    if(!map) return;
    container.map = map;
};

for(const actionName of PassthroughActions) {
    WorldEditor.prototype[actionName] = function() {
        this.sendAction(actionName);
    }
}

AddFileActions(WorldEditor.prototype);
AddEventProcessing(WorldEditor.prototype);

export default WorldEditor;
