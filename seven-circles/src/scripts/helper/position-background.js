import ZIndexBook from "../../world/z-indices.js";

function AddPositionBackground(world,renderer,x,y,width,height,topLayer) {
    const {grid} = world;

    let tileSize = 0;
    world.dispatchRenderer.addResize(()=>{
        tileSize = grid.tileSize;
    });

    const buffer = new OffscreenCanvas(0,0);
    const bufferContext = buffer.getContext("2d");

    let didRender = false;
    let bufferX, bufferY;

    const render = (context,size,time) => {

        const screenLocation = grid.getLocation(x,y);

        const renderX = screenLocation.x;
        const renderY = screenLocation.y;

        const renderWidth = Math.floor(width * tileSize);
        const renderHeight = Math.floor(height * tileSize);

        if(!grid.objectOnScreen(
            renderX,renderY,renderWidth,renderHeight)
        ) {
            didRender = false; return;
        }

        buffer.width = renderWidth;
        buffer.height = renderHeight;

        renderer.render(bufferContext,{
            width: renderWidth,
            height: renderHeight
        },time);

        context.drawImage(
            buffer,0,0,renderWidth,renderHeight,
            renderX,renderY,renderWidth,renderHeight
        );

        bufferX = renderX; bufferY = renderY;

        didRender = true;
    };

    world.dispatchRenderer.addBackground(render);
    if(topLayer) {
        const {x,y,width,height} = topLayer;
        world.dispatchRenderer.addRender(context=>{
            if(!didRender) return;
            const screenLocation = grid.getLocation(x,y);

            const renderX = screenLocation.x;
            const renderY = screenLocation.y;
    
            const renderWidth = Math.floor(width * tileSize);
            const renderHeight = Math.floor(height * tileSize);

            context.drawImage(
                buffer,renderX-bufferX,renderY-bufferY,renderWidth,renderHeight,
                renderX,renderY,renderWidth,renderHeight
            );

        },ZIndexBook.SuperImposedBackground);
    }
}
export default AddPositionBackground;
