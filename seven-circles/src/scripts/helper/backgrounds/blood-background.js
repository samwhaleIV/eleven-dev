function GetPattern(buffer,context,image,tileSize) {
    const {width,height} = image;

    buffer.width = Math.floor(width / 16) * tileSize;
    buffer.height = Math.floor(height / 16) * tileSize;

    context.imageSmoothingEnabled = false;

    context.drawImage(
        image,0,0,width,height,0,0,buffer.width,buffer.height
    );

    const pattern = context.createPattern(buffer,"repeat");
    return pattern;
}

function AddBloodBackground(world) {
    const image = Eleven.ResourceManager.getImage("effects/blood");
    const buffer = new OffscreenCanvas(0,0);
    const bufferContext = buffer.getContext("2d",{alpha:false});

    let pattern = "black";
    let matrix = new DOMMatrix();

    const {camera,dispatchRenderer,grid} = world;

    let tileSize = 0;
    const updatePattern = (x,y) => {
        x *= tileSize, y *= tileSize;
        matrix.translateSelf(x,y);
        pattern.setTransform(matrix);
        matrix.translateSelf(-x,-y);
    };

    const resize = () => {
        const newTileSize = grid.tileSize;
        if(tileSize === newTileSize) return;
        tileSize = newTileSize;

        pattern = GetPattern(
            buffer,bufferContext,image,tileSize
        );
    };

    dispatchRenderer.addResize(resize);

    const render = (context,{width,height}) => {
        context.fillStyle = pattern;

        const smoothingEnabled = context.imageSmoothingEnabled;
        context.imageSmoothingEnabled = true;
    
        updatePattern(-camera.x,-camera.y);
        context.fillRect(0,0,width,height);

        const startAlpha = context.globalAlpha;
        context.globalAlpha = 0.33;

        updatePattern(camera.x/-2,camera.y/-2);
        context.fillRect(0,0,width,height);

        context.globalAlpha = startAlpha;
        context.imageSmoothingEnabled = smoothingEnabled;
    };
    dispatchRenderer.addBackground(render);
}
export default AddBloodBackground;

