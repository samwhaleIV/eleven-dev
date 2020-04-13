import ZIndexBook from "../../../world/z-indices.js";
import DoorBase from "./door-base.js";

const TRANSITION_TIME = 500;

const frames = {
    grayDoor: {
        top: 12,
        center: 11,
        bottom: 13,
        collision: 1,
        topCollision: 4,
        bottomCollision: 5
    }
};
const FALLBACK_FRAME = frames.grayDoor;

function DoorRenderer(image,x,y,tileSize,normal,top,bottom,duration) {
    this.openStart = null; this.closeStart = null;

    this.x = x; this.y = y;
    this.width = 1; this.height = 3;

    this.open = false;

    const renderStatic = (context,x,y,width,open) => {
        const renderSize = width;

        if(open) {
            context.drawImage(
                image,top[0],top[1],tileSize,tileSize,
                x,y,renderSize,renderSize
            );
            context.drawImage(
                image,bottom[0],bottom[1],tileSize,tileSize,
                x,y+renderSize*2,renderSize,renderSize
            );
        } else {
            const [texX,texY] = normal;
            context.drawImage(
                image,texX,texY,tileSize,tileSize,
                x,y,renderSize,renderSize
            );
            context.drawImage(
                image,texX,texY,tileSize,tileSize,
                x,y+renderSize,renderSize,renderSize
            );
            context.drawImage(
                image,texX,texY,tileSize,tileSize,
                x,y+renderSize*2,renderSize,renderSize
            );
        }
    };
    const renderMoving = (context,x,y,width,t) => {
        const renderSize = width;

        const movementDistance = renderSize * t;
        const middleStart = y + renderSize;

        context.drawImage(
            image,top[0],top[1],tileSize,tileSize,
            x,middleStart- movementDistance,renderSize,renderSize
        );
        context.drawImage(
            image,bottom[0],bottom[1],tileSize,tileSize,
            x,middleStart + movementDistance,renderSize,renderSize
        );


        const [texX,texY] = normal;

        t = 1 - t;

        const animatedTileSize = tileSize - (tileSize * t);

        context.drawImage(
            image,texX,texY,tileSize,animatedTileSize,
            x,y,renderSize,renderSize * t
        );

        context.drawImage(
            image,texX,texY,tileSize,animatedTileSize,
            x,y+renderSize*2 + movementDistance,
            renderSize,renderSize - movementDistance
        );
    };

    this.render = (context,x,y,width,_,time) => {
        if(this.openStart !== null) {
            let t = (time.now-this.openStart) / duration;
            if(t < 0) {
                renderStatic(context,x,y,width,false);
                return;
            } else if(t > 1) {
                this.openStart = null;
                renderStatic(context,x,y,width,this.open,true);
                return;
            }
            renderMoving(context,x,y,width,t);
        } else if(this.closeStart !== null) {
            let t = (time.now-this.closeStart) / duration;
            if(t < 0) {
                renderStatic(context,x,y,width,true);
                return;
            } else if(t > 1) {
                this.closeStart = null;
                renderStatic(context,x,y,width,false);
                return;
            }
            renderMoving(context,x,y,width,1 - t);
        } else {
            renderStatic(context,x,y,width,this.open);
        }
    };
}

function SpriteDoor(
    world,x,y,frame,startOpen,duration,interactionValue
) {

    if(typeof frame === "string") {
        frame = frames[frame];
    }
    if(!frame) frame = FALLBACK_FRAME;

    duration = duration || TRANSITION_TIME;

    const doorRenderer = new DoorRenderer(
        world.tileset,x,y,world.tileSize,
        world.getTextureXY(frame.center),
        world.getTextureXY(frame.top),
        world.getTextureXY(frame.bottom),
        duration
    );

    const ID = world.spriteLayer.add(
        doorRenderer,ZIndexBook.SpriteDoor
    );
    this.ID = ID;
    this.remove = () => {
        world.spriteLayer.remove(ID);
    };

    const setOpenCollision = () => {
        world.setCollisionTile(x,y,frame.topCollision);
        world.setCollisionTile(x,y+1,0);
        world.setCollisionTile(x,y+2,frame.bottomCollision);
    };

    let locked = false;
    const canChange = () => {
        return !locked && doorRenderer.closeStart === null && doorRenderer.openStart === null;
    };

    const open = instant => {
        if(!canChange()) return false;

        if(instant) {
            setOpenCollision();
        }

        doorRenderer.open = true;
        doorRenderer.openStart = performance.now();

        this.deferCollisionUpdate();

        if(!instant) (async () => {
            locked = true;
            await frameDelay(duration);
            setOpenCollision();
            world.pushCollisionChanges();
            locked = false;
        })();

        return true;
    };
    const close = () => {
        if(!canChange()) return false;

        world.setCollisionTile(x,y,frame.collision);
        world.setCollisionTile(x,y+1,frame.collision);
        world.setCollisionTile(x,y+2,frame.collision);
        doorRenderer.open = false;
        doorRenderer.closeStart = performance.now();

        return true;
    };

    DoorBase.call(this,world,open,close,startOpen);
    doorRenderer.openStart = null;
    doorRenderer.closeStart = null;

    Object.defineProperty(this,"interactionValue",{
        value: typeof interactionValue === "number" ? interactionValue : null,
        writable: false,
        enumerable: true,
        configurable: false
    });

    if(this.interactionValue !== null) {
        interactionValue = this.interactionValue;
        this.tryInteract = ({value},callback) => {
            if(value === interactionValue) {
                callback(this);
                return true;
            } else {
                return false;
            }
        };
        world.setInteractionTile(x,y,interactionValue);
        world.setInteractionTile(x,y+1,interactionValue);
        world.setInteractionTile(x,y+2,interactionValue);
    }
}
export default SpriteDoor;
