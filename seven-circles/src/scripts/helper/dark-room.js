import ZIndexBook from "../../world/z-indices.js";

const SPOT_SIZE = 32;
const SPOT_RADIUS = SPOT_SIZE * (40 / 100);

const SHADOW_COLOR = `rgba(0,0,0,${232/256})`;

const WORLD_SPOT_SIZE = 2.25;
const WORLD_SPOT_OFFSET = WORLD_SPOT_SIZE / -2;

const SPOT_BLUR_PIXELS = (15 / 256) * SPOT_SIZE;

function getSpotTexture() {
    const buffer = new OffscreenCanvas(SPOT_SIZE,SPOT_SIZE);
    const context = buffer.getContext("2d",{alpha:true});

    context.clearRect(0,0,buffer.width,buffer.height);
    context.beginPath();
    context.arc(buffer.width/2,buffer.height/2,SPOT_RADIUS,0,Math.PI*2);
    context.fillStyle = "blue";
    context.filter = `blur(${SPOT_BLUR_PIXELS}px)`;
    context.fill();

    return buffer;
}

function getSpots(lightingData,getXY) {
    const spots = new Array();
    for(let i = 0;i<lightingData.length;i++) {
        if(lightingData[i] > 0) {
            const [x,y] = getXY(i)
            spots.push({x:x+0.5,y:y+0.5});
        }
    }
    return spots;
}

function DarkRoom(world,targets) {
    if(!targets) targets = [world.player];

    const {highSpriteLayer,dispatchRenderer,tileRenderer} = world;
    
    /* Dark room does not watch for lighting layer changes */
    const spots = getSpots(
        tileRenderer.readLayer(5),tileRenderer.getXY
    );
    for(let i = 0;i<targets.length;i++) {
        spots.push({target:targets[i]});
    }

    const fogBuffer = new OffscreenCanvas(1,1);
    const fogContext = fogBuffer.getContext("2d",{alpha:true});

    dispatchRenderer.addFinalize((_,{width,height}) => {
        fogContext.globalCompositeOperation = "source-over";
        fogBuffer.width = width, fogBuffer.height = height;
        fogContext.fillStyle = SHADOW_COLOR;
        fogContext.fillRect(0,0,width,height);
        fogContext.globalCompositeOperation = "destination-out";
    },ZIndexBook.FogShadow);

    const spotTexture = getSpotTexture();

    function SpotSprite(x,y) {
        this.width = WORLD_SPOT_SIZE;
        this.height = WORLD_SPOT_SIZE;
        this.x = x; this.y = y;
        this.noRender = false;
        this.render = (_,x,y,width,height) => {
            if(this.noRender) return;
            fogContext.drawImage(spotTexture,0,0,SPOT_SIZE,SPOT_SIZE,x,y,width,height);
        };
    }

    for(let i = 0;i<spots.length;i++) {
        const {target,x,y} = spots[i];
        const spotSprite = new SpotSprite(
            x+WORLD_SPOT_OFFSET,y+WORLD_SPOT_OFFSET
        );
        if(target) spotSprite.update = () => {
            let {x,y,width,height,xOffset,yOffset,noFog} = target;
            spotSprite.noRender = !noFog;

            x += WORLD_SPOT_OFFSET, y += WORLD_SPOT_OFFSET;
            if(xOffset) x += xOffset; if(yOffset) y += yOffset;
            x += width / 2; y += height / 2;
            spotSprite.x = x; spotSprite.y = y;
        };
        highSpriteLayer.add(spotSprite,ZIndexBook.FogHoles);
    }

    dispatchRenderer.addFinalize((context,size) => {
        context.drawImage(
            fogBuffer,0,0,fogBuffer.width,fogBuffer.height,
            0,0,size.width,size.height
        );
    },ZIndexBook.FogFinalize);
}

export default DarkRoom;
