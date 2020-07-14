function ObjectPlacer(world) {

    const {grid,container} = world;

    const getObjectBounds = object => {
        const x = object.getProperty("x"), y = object.getProperty("y");
        const {width,height} = object.self;
        return [x,y,x+width,y+height];
    };

    const getObjectRenderLocation = object => {
        const x = object.getProperty("x"), y = object.getProperty("y");
        const screenLocation = grid.getLocation(x,y);
        let {width,height} = object.self;
        width *= grid.tileSize, height *= grid.tileSize;
        return [screenLocation.x,screenLocation.y,width,height];
    };

    const selectionData = {};
    let selectionRenderData = [];

    const updateSelectionRenderData = () => {
        selectionRenderData = Object.values(selectionData);
    };

    const removeFromSelection = object => {
        delete selectionData[object.ID];
        updateSelectionRenderData();
    };
    const addToSelection = object => {
        selectionData[object.ID] = object;
        updateSelectionRenderData();
    };
    const inSelection = object => {
        return object.ID in selectionData;
    };
    const clearSelection = () => {
        for(const key in selectionData) {
            delete selectionData[key];
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

        for(const object of selectionRenderData) {
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

    const clickDown = ({x,y,ctrlKey}) => {

        const object = getObjectAtLocation(x,y); 
        selectionStart.x = x, selectionStart.y = y; 
        selectionEnd.x = x, selectionEnd.y = y; 
        
        if(ctrlKey) {
            if(!object) return;
            if(inSelection(object)) {
                removeFromSelection(object);
            } else {
                addToSelection(object);
            }
        } else {
            clearSelection();
            if(object) {
                addToSelection(object);
            }
        }
    };
    const clickUp = () => {
        if(selectionStart.x === selectionEnd.x && selectionStart.y === selectionEnd.y) {
            for(const object of selectionRenderData) {
                delete object.selectionData;
            }
            return;
        }

        const events = [];

        for(const object of selectionRenderData) {
            const {startX,startY} = object.selectionData;
            events.push({
                type: "property", object,
                property: "x",
                oldValue: startX,
                newValue: object.getProperty("x")
            },{
                type: "property", object,
                property: "y",
                oldValue: startY,
                newValue: object.getProperty("y")
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

        for(const object of selectionRenderData) {
            if(!object.selectionData) {
                const x = object.getProperty("x"), y = object.getProperty("y");
                object.selectionData = {
                    startX: x, startY: y,
                    x: selectionStartTile.x - x,
                    y: selectionStartTile.y - y
                };
            }

            object.setProperty("x",tileLocation.x - object.selectionData.x);
            object.setProperty("y",tileLocation.y - object.selectionData.y);
        }
    };

    world.setAction("deleteSelection",()=>{
        const selectedItems = selectionRenderData;
        if(!selectedItems.length) return;
        const events = [];


    });
    world.setAction("selectAll",()=>{
        for(const key in selectionData) {
            delete selectionData[key];
        }
        for(const object of container.getObjects()) {
            selectionData[object.ID] = object;
        }
        updateSelectionRenderData();
    });
    world.setAction("copy",()=>{

    });
    world.setAction("paste",()=>{

    });

    this.bindToFrame = target => {
        Object.assign(target,{
            clickDown,clickUp,pointerMove
        });
    };
}
export default ObjectPlacer;
