import GetObject from "../../../src/sequence/objects.js";

const actionProcessors = {
    property: {
        forward: propertyActionProcessor,
        reverse: propertyActionProcessorReverse
    },
    create: {
        forward: createActionProcessor
    },
    delete: {
        forward: deleteActionProcessor,
        reverse: deleteActionProcessorReverse
    },
    reverseDelete: {
        forward: deleteActionProcessorReverse,
        reverse: deleteActionProcessor
    }
};

function propertyActionProcessor(action) {
    let {objectID,property,newValue,value,oldValue} = action;
    const object = this.container.getObject(objectID);
    if(!newValue && value !== undefined) {
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
    if(this.objectIDReused) {
        this.objectIDReused(objectID);
    }
}

function createActionProcessor(action) {
    const {serialData,objectType} = action;
    const objectID = this.container.IDCounter++;
    action.objectID = objectID;
    const object = GetObject(this.container,objectType,objectID);
    object.create(serialData);
}

function getActionProcessor(type,reverse) {
    return actionProcessors[type][reverse ? "reverse" : "forward"];
}

function AddEventProcessing(prototype) {

    prototype.processAction = function(action,reverse) {
        const processor = getActionProcessor(action.type,reverse);
        if(action.type === "create") {
            action.type = "reverseDelete";
        }
        const {object} = action;
        if(object) {
            action.objectID = object.ID;
            delete action.object;
        }
        processor.call(this,action);
    }
    
    prototype.addEvents = function(actions) {
        if(!actions.length) return;
        for(const action of actions) {
            this.processAction(action,false);
        }
        this.undoStack.push(actions);
        this.redoStack.splice(0);
        this.unsaved = true;
    };
    
    prototype.undo = function() {
        if(!this.undoStack.length) return;
        const eventStack = this.undoStack.pop();
        for(const action of eventStack) {
            this.processAction(action,true);
        }
        this.redoStack.push(eventStack);
        this.unsaved = true;
    };
    
    prototype.redo = function() {
        if(!this.redoStack.length) return;
        const eventStack = this.redoStack.pop();
        for(const action of eventStack) {
            this.processAction(action,false);
        }
        this.undoStack.push(eventStack);
        this.unsaved = true;
    };
}
export default AddEventProcessing;
