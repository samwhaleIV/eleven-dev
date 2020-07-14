function ObjectPlacer(world) {

    const {grid,container} = world;

    const getObjectBounds = object => {
        const x = object.x, y = object.y;
        const {width,height} = object.self;
        return [x,y,x+width,y+height];
    };

    const getObjectRenderLocation = object => {
        const x = object.x, y = object.y;
        const screenLocation = grid.getLocation(x,y);
        let {width,height} = object.self;
        width *= grid.tileSize, height *= grid.tileSize;
        return [screenLocation.x,screenLocation.y,width,height];
    };

    const selectionData = {};
    let selectionRenderData = [];

    const getSelections = function*() {
        for(const ID of selectionRenderData) {
            const object = container.getObject(ID);
            if(object) yield object;
        }
    };

    const updateSelectionRenderData = () => {
        selectionRenderData = Object.keys(selectionData);
    };

    const removeFromSelection = object => {
        delete selectionData[object.ID];
        updateSelectionRenderData();
    };
    const addToSelection = (object,shiftKey) => {
        selectionData[object.ID] = true;
        if(shiftKey) {
            for(const {ID,type} of container.getObjects()) {
                if(type === object.type) selectionData[ID] = true;
            }
        }
        updateSelectionRenderData();
    };
    const inSelection = object => {
        return object.ID in selectionData;
    };
    const clearSelection = () => {
        for(const ID in selectionData) {
            delete selectionData[ID];
        }
        updateSelectionRenderData();
    };

    const selectionRenderer = (context,size,time) => {
        if(!selectionRenderData.length) return;
        context.fillStyle = "#1489FF8C";
        context.strokeStyle = "white";
        context.lineWidth = 1;
        context.lineJoin = "miter";

        context.setLineDash([4,2]);
        context.lineDashOffset = -(time.now / 30) % 6;

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

    const selectionStart = {x:null,y:null}, selectionEnd = {x:null,y:null};

    const clickDown = ({x,y,ctrlKey,shiftKey}) => {

        const object = getObjectAtLocation(x,y); 
        selectionStart.x = x, selectionStart.y = y; 
        selectionEnd.x = x, selectionEnd.y = y; 
        
        if(ctrlKey) {
            if(!object) return;
            if(inSelection(object)) {
                removeFromSelection(object);
            } else {
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
        if(!selectionRenderData.length) return;

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
        updateSelectionRenderData();
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
            const {width,height} = object.self;

            serialData.x = x - copyLocation.x;
            serialData.y = y - copyLocation.y;

            const copyObject = {
                serialData,objectType,width,height
            };
            objects.push(copyObject);
        }

        return objects;
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
        
        let newObjects = Object.values(container.objects);
        newObjects = newObjects.slice(newObjects.length-events.length);

        if(!newObjects.length) return;
        clearSelection();
        for(const {ID} of newObjects) {
            selectionData[ID] = true;
        }
        updateSelectionRenderData();
    };

    world.setAction("copy",()=>{
        if(!selectionRenderData.length) return;
        copyData = getCopyData();
    });
    world.setAction("paste",()=>{
        if(copyData) pasteData(copyData);
    });
    world.setAction("cut",()=>{
        if(!selectionRenderData.length) return;
        copyData = getCopyData();
        deleteSelection();
    });

    this.bindToFrame = target => {
        Object.assign(target,{
            clickDown,clickUp,pointerMove
        });
    };
}
export default ObjectPlacer;
