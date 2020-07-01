import GetInteractionStart from "../../self/get-interaction-start.js";
import GateTeleport from "./gate-teleport.js";

const INTERACTION_ID = GetInteractionStart();

const WIDTH = 2;
const HEIGHT = 3;

const PLASMA_SHIFT_DURATION = 1300;

function HellGate(world,x,y,startOpen,ID,callback) {
    ID += INTERACTION_ID;

    for(let xOffset = 0;xOffset<WIDTH;xOffset++) {
        world.setInteractionTile(x+xOffset,y+2,ID);
    }

    let open = startOpen;

    const {grid} = world;

    const drawGatePlasma = (context,t) => {
        if(!grid.objectOnScreen(x,y,WIDTH,HEIGHT)) return;

        const size = grid.tileSize;
        const location = grid.getLocation(x,y+1);

        const textureHeight = 32 * t;
        const height = (HEIGHT-1) * size * t;

        context.drawImage(
            world.tileset,448,432,32,textureHeight,
            location.x,location.y,size*WIDTH,height
        );
    };

    const setTiles = async (a,b,c,d) => {
        world.setForegroundTile(x,y+1,a);
        world.setForegroundTile(x+1,y+1,b);
        world.setForegroundTile(x,y+2,c);
        world.setForegroundTile(x+1,y+2,d);
    };

    const setOpenTiles = () => setTiles(1497,1498,1561,1562);
    const setClosedTiles = () => setTiles(1495,1496,1559,1560);

    let animating = false;

    const animateGateChange = toOpen => {
        if(animating) return;
        animating = true;
        const startTime = performance.now();
        const {dispatchRenderer} = world;
        const renderID = dispatchRenderer.addRender((context,_,time) => {
            let t = (time.now - startTime) / PLASMA_SHIFT_DURATION;
            if(t > 1) {
                dispatchRenderer.removeRender(renderID);
                animating = false;
                return;
            } else if(t < 0) t = 0;
            drawGatePlasma(context,toOpen ? t : 1 - t);
        },-1);
    };

    const animateGateOpen = () => {
        setOpenTiles();
        animateGateChange(true);
    };
    const animateGateClose = () => {
        setClosedTiles();
        animateGateChange(false);
    };

    this.open = () => {
        if(!open) animateGateOpen();
        open = true;
    };
    this.close = () => {
        if(open) animateGateClose();
        open = false;
    };

    if(startOpen) {
        this.open();
        setOpenTiles();
    } else {
        this.close();
        setClosedTiles();
    }

    this.tryInteract = ({value}) => {
        if(value !== ID) return;
        if(open) {
            GateTeleport(world,callback);
        } else {
            world.message("The gate is closed.");
        }
        return true;
    };
}
export default HellGate;
