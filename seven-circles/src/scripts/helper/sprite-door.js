import ZIndexBook from "../../world/z-indices.js";

const TRANSITION_TIME = 500;

function DoorRenderer(image,x,y,tileSize,normal,top,bottom,duration) {
    this.openStart = null; this.closeStart = null;

    this.x = x; this.y = y;
    this.width = 1; this.height = 3;

    this.open = false;

    const renderStatic = (context,x,y,width) => {
        const renderSize = width;

        if(this.open) {
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
            if(t < 0) t = 0; else if(t > 1) {
                this.openStart = null;
                renderStatic(context,x,y,width);
                return;
            }
            renderMoving(context,x,y,width,t);
        } else if(this.closeStart !== null) {
            let t = (time.now-this.closeStart) / duration;
            if(t < 0) t = 0; else if(t > 1) {
                this.closeStart = null;
                renderStatic(context,x,y,width);
                return;
            }
            renderMoving(context,x,y,width,1 - t);
        } else {
            renderStatic(context,x,y,width);
        }
    };
}

function SpriteDoor(
    world,x,y,normal,top,bottom,
    topCollision,bottomCollision,startOpen,duration
) {
    duration = duration || TRANSITION_TIME;

    const doorRenderer = new DoorRenderer(
        world.tileset,x,y,world.tileSize,
        world.getTextureXY(normal),
        world.getTextureXY(top),
        world.getTextureXY(bottom),
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
        world.setCollisionTile(x,y,topCollision);
        world.setCollisionTile(x,y+1,0);
        world.setCollisionTile(x,y+2,bottomCollision);
    };

    let locked = false;

    const open = instant => {
        if(instant) {
            setOpenCollision();
        }

        doorRenderer.open = true;
        doorRenderer.openStart = performance.now();

        if(!instant) (async () => {
            locked = true;
            await Eleven.FrameTimeout(duration);
            setOpenCollision();
            world.pushCollisionChanges();
            locked = false;
        })();
    };
    const close = () => {
        world.setCollisionTile(x,y,1);
        world.setCollisionTile(x,y+1,1);
        world.setCollisionTile(x,y+2,1);
        doorRenderer.open = false;
        doorRenderer.closeStart = performance.now();
    };
    let opened = startOpen;

    const canChange = () => {
        return !locked && doorRenderer.closeStart === null && doorRenderer.openStart === null;
    };

    this.open = () => {
        if(opened || !canChange()) return;
        open();
        opened = true;
    };
    this.close = () => {
        if(!opened || !canChange()) return;
        close();
        world.pushCollisionChanges();
        opened = false;
    };
    this.toggle = () => {
        if(opened) {
            this.close();
        } else {
            this.open();
        }
    };

    if(startOpen) open(true); else close();

    doorRenderer.openStart = null;
    doorRenderer.closeStart = null;
}
export default SpriteDoor;
