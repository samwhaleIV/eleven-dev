const MIN_SCALE = 1 / 8;
const START_SCALE = 1 / 2;
const MAX_SCALE = 1;

function InstallGridView(world) {

    let showingGrid = false, gridRenderID = null;

    const {grid,dispatchRenderer} = world;

    let gridScale = START_SCALE;

    Object.defineProperties(world,{
        gridScale: {
            get: () => gridScale,
            set: value => {
                if(value < MIN_SCALE) {
                    value = MIN_SCALE;
                } else if(value > MAX_SCALE) {
                    value = MAX_SCALE;
                }
                gridScale = value;
            },
            enumerable: true
        },
        gridVisible: {
            get: () => showingGrid,
            enumerable: true
        }
    });

    const gridRenderer = (context,{width,height}) => {

        const topLeft = grid.getLocation(0,0);
    
        const bottomRight = grid.getLocation(grid.width,grid.height);

        const size = grid.tileSize * gridScale;

        topLeft.x = Math.floor(topLeft.x) + 0.5;
        topLeft.y = Math.floor(topLeft.y) + 0.5;
        bottomRight.x = Math.floor(bottomRight.x) + 0.5;
        bottomRight.y = Math.floor(bottomRight.y) + 0.5;

        width = bottomRight.x - topLeft.x;
        height = bottomRight.y - topLeft.y;

        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.lineJoin = "miter";
        context.lineDashOffset = 0;
        context.setLineDash([1,3]);

        const xEnd = bottomRight.x + size;
        for(let x = topLeft.x;x<xEnd;x += size) {
            if(x < 0) continue;
            context.beginPath();
            context.moveTo(x,topLeft.y);
            context.lineTo(x,topLeft.y+height);
            context.stroke();
        }

        const yEnd = bottomRight.y + size;
        for(let y = topLeft.y;y<yEnd;y += size) {
            if(y < 0) continue;
            context.beginPath();
            context.moveTo(topLeft.x,y);
            context.lineTo(topLeft.x+width,y);
            context.stroke();
        }
    };

    const enableGridRenderer = () => {
        gridRenderID = dispatchRenderer.addRender(gridRenderer,100);
    };
    const disableGridRenderer = () => {
        if(gridRenderID === null) return;
        dispatchRenderer.removeRender(gridRenderID);
    };

    const showGrid = () => {
        if(showingGrid) return;
        enableGridRenderer();
        showingGrid = true;
    };
    const hideGrid = () => {
        if(!showingGrid) return;
        disableGridRenderer();
        showingGrid = false;
    };

    const toggleGrid = () => {
        if(showingGrid) {
            hideGrid();
        } else {
            showGrid();
        }
    };

    world.gridToggler = toggleGrid;
};
export default InstallGridView;
