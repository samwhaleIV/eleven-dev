const SELECTION_COLOR = "#1489FF8C";
const CATERPILLAR_TIME = 30;
const DOUBLE_CLICK_TIMEOUT = 500;

function ObjectSelector(world) {
    const {grid,container} = world;

    const getObjectBounds = object => {
        const x = object.x, y = object.y;
        const {width,height} = object;
        return [x,y,x+width,y+height];
    };

    const getObjectRenderLocation = object => {
        const x = object.x, y = object.y;
        const screenLocation = grid.getLocation(x,y);
        let {width,height} = object;
        width *= grid.tileSize, height *= grid.tileSize;
        return [screenLocation.x,screenLocation.y,width,height];
    };

    const inBounds = (x,y,bounds) => {
        const [left,top,right,bottom] = bounds;
        return x >= left && x < right && y >= top && y < bottom;
    };

    const getObjectAtLocation = (x,y) => {
        const tileLocation = grid.getTileLocation(x,y);
        const worldX = tileLocation.x, worldY = tileLocation.y;

        for(const object of container.getObjects()) {
            const bounds = getObjectBounds(object);
            if(inBounds(worldX,worldY,bounds)) {
                return object;
            }
        }
        return null;
    };

    const selectionData = new Object();
    let selectionList = new Array();

    const getSelections = function*() {
        for(const ID of selectionList) {
            const object = container.getObject(ID);
            if(object) yield object;
        }
    };

    let lastSelection = null;
    const updateSelectionList = () => {
        selectionList = Object.keys(selectionData);
        let singleItem;
        if(selectionList.length === 1) {
            singleItem = container.getObject(selectionList[0]);
        } else {
           singleItem = null;
        }
        if(singleItem) {
            if(lastSelection) {
                lastSelection.deletionCallback = null;
            }
            lastSelection = null;
            singleItem.deletionCallback = () => {
                world.selectionChanged(null);
            };
            lastSelection = singleItem;
        }
        if(world.selectionChanged) {
            world.selectionChanged(singleItem);
        }
    };

    world.objectIDReused = () => {
        if(lastSelection !== null) {
            updateSelectionList();
        }
    };

    const addToSelection = (object,shiftKey) => {
        selectionData[object.ID] = true;
        if(shiftKey) {
            for(const {ID,type} of container.getObjects()) {
                if(type === object.type) selectionData[ID] = true;
            }
        }
        updateSelectionList();
    };
    const clearSelection = () => {
        for(const ID in selectionData) {
            delete selectionData[ID];
        }
        updateSelectionList();
    };
    world.clearSelection = clearSelection;

    const selectionRenderer = (context,_,time) => {
        if(!selectionList.length) return;
        context.fillStyle = SELECTION_COLOR;

        context.strokeStyle = "white";
        context.lineWidth = 1;
        context.lineJoin = "miter";
        context.lineDashOffset = 0;

        context.setLineDash([4,2]);
        context.lineDashOffset = -(time.now / CATERPILLAR_TIME) % 6;

        for(const object of getSelections()) {
    
            let [x,y,width,height] = getObjectRenderLocation(object);

            x = Math.floor(x) + 0.5, y = Math.floor(y) + 0.5;

            context.fillRect(x,y,width,height);

            context.strokeStyle = "black";
            context.strokeRect(x,y,width,height);

            context.lineDashOffset += 3;
            context.strokeStyle = "white";
            context.strokeRect(x,y,width,height);
            context.lineDashOffset -= 3;
        }
    };
    world.dispatchRenderer.addFinalize(selectionRenderer);

    const selectionStart = {x:null,y:null};
    const selectionEnd = {x:null,y:null};

    let lastClickTimeout = null;
    let inDoubleClickFrame = false;

    const clearDoubleClickFrame = () => {
        clearTimeout(lastClickTimeout);
        lastClickTimeout = null;
        inDoubleClickFrame = false;
    };

    const doubleClickProcessor = () => {
        if(selectionList.length || inDoubleClickFrame) {
            if(!selectionList.length && inDoubleClickFrame) {
                if(world.onDoubleClick) {
                    world.onDoubleClick();
                }
            }
            clearDoubleClickFrame();
            return;
        }

        inDoubleClickFrame = true;
        lastClickTimeout = setTimeout(
            clearDoubleClickFrame,DOUBLE_CLICK_TIMEOUT
        );
    };

    const clickDown = ({x,y,ctrlKey,shiftKey}) => {

        const object = getObjectAtLocation(x,y); 
        selectionStart.x = x, selectionStart.y = y; 
        selectionEnd.x = x, selectionEnd.y = y; 
        
        if(ctrlKey) {
            if(object) {
                addToSelection(object,shiftKey);
            }
        } else {
            clearSelection();
            if(object) {
                addToSelection(object,shiftKey);
            }
        }
    };
    const clickUp = () => {
        doubleClickProcessor();
        if(selectionStart.x === selectionEnd.x && selectionStart.y === selectionEnd.y) {
            for(const object of getSelections()) {
                delete object.selectionData;
            }
            return;
        }

        const events = [];

        for(const object of getSelections()) {
            const {startX,startY} = object.selectionData;
            events.push({
                type: "property", object,
                property: "x",
                oldValue: startX,
                newValue: object.x
            },{
                type: "property", object,
                property: "y",
                oldValue: startY,
                newValue: object.y
            });
            delete object.selectionData;
        }

        world.addEvents(events);
    };
    const pointerMove = ({x,y}) => {
        selectionEnd.x = x, selectionEnd.y = y;
        if(!selectionList.length) return;

        const tileLocation = grid.getTileLocation(x,y);
        const selectionStartTile = grid.getTileLocation(
            selectionStart.x,selectionStart.y
        );

        for(const object of getSelections()) {
            if(!object.selectionData) {
                const x = object.x, y = object.y;
                object.selectionData = {
                    startX: x, startY: y,
                    x: selectionStartTile.x - x,
                    y: selectionStartTile.y - y
                };
            }

            object.x = tileLocation.x - object.selectionData.x;
            object.y = tileLocation.y - object.selectionData.y;
        }

        if(world.gridVisible && selectionList.length === 1) {
            
            const object = container.getObject(selectionList[0]);
            if(!object) return;

            const gridScale = 1 / world.gridScale;
            object.x = Math.round(object.x * gridScale) / gridScale;
            object.y = Math.round(object.y * gridScale) / gridScale;
        }
    };

    const deleteSelection = ()=>{
        const events = [];
        for(const object of getSelections()) {
            events.push({
                type: "delete", object
            });
        }
        world.addEvents(events);
    };

    world.setAction("deleteSelection",deleteSelection);
    world.setAction("selectAll",()=>{
        for(const ID in selectionData) {
            delete selectionData[ID];
        }
        for(const object of container.getObjects()) {
            selectionData[object.ID] = true;
        }
        updateSelectionList();
    });

    let copyData = null;

    const getMouseTile = () => {
        const {x,y} = Eleven.CanvasManager.pointer;
        const tileLocation = grid.getTileLocation(x,y);
        return tileLocation;
    };

    const getCopyData = () => {
        const copyLocation = getMouseTile();

        const objects = [];

        for(const object of getSelections()) {

            const serialData = object.serialize();
            const objectType = object.type;

            const {x,y} = object;
            const {width,height} = object;
            serialData.x = x - copyLocation.x;
            serialData.y = y - copyLocation.y;

            const copyObject = {
                serialData,objectType,width,height
            };
            objects.push(copyObject);
        }

        return objects;
    };

    const getRecentObjects = count => {
        let newObjects = Object.values(
            container.objects
        );
        newObjects = newObjects.slice(
            newObjects.length-count
        );
        return newObjects;
    };

    const pasteData = copyData => {
        const pasteLocation = getMouseTile();

        const events = [];
        if(copyData.length === 1) {
            let {serialData,objectType,width,height} = copyData[0];
            serialData.x = pasteLocation.x - width / 2;
            serialData.y = pasteLocation.y - height / 2;
            events.push({type: "create",serialData,objectType});
        } else {
            for(let {serialData,objectType} of copyData) {
                serialData = Object.assign({},serialData);
                serialData.x += pasteLocation.x;
                serialData.y += pasteLocation.y;
                events.push({type: "create",serialData,objectType});
            }
        }

        world.addEvents(events);
        
        const newObjects = getRecentObjects(events.length);

        if(!newObjects.length) return;
        clearSelection();
        for(const {ID} of newObjects) {
            selectionData[ID] = true;
        }
        updateSelectionList();
    };

    world.browserPastedObject = () => {
        clearSelection();
        const newObject = getRecentObjects(1)[0];
        addToSelection(newObject,false);
    };

    world.setAction("copy",()=>{
        if(!selectionList.length) return;
        copyData = getCopyData();
    });
    world.setAction("paste",()=>{
        if(copyData) pasteData(copyData);
    });
    world.setAction("cut",()=>{
        if(!selectionList.length) return;
        copyData = getCopyData();
        deleteSelection();
    });

    this.bindToFrame = target => {
        Object.assign(
            target,{clickDown,clickUp,pointerMove}
        );
    };
}
export default ObjectSelector;
