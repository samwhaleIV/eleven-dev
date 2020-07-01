import ZIndexBook from "../../../../world/z-indices.js";
import DoorBase from "../door-base.js";
import SpriteDoorFrames from "./sprite-door-frames.js";
import DoorRenderer from "./door-renderer.js";

const TRANSITION_TIME = 500;

function SpriteDoor(
    world,x,y,frame,startOpen,duration,interactionValue
) {
    if(typeof frame === "string") {
        frame = SpriteDoorFrames[frame];
    }
    if(!frame) frame = SpriteDoorFrames.grayDoor;
    duration = duration || TRANSITION_TIME;

    const doorRenderer = new DoorRenderer(
        world.tileset,x,y,world.tileSize,
        world.getTextureXY(frame.center),
        world.getTextureXY(frame.top),
        world.getTextureXY(frame.bottom),
        duration
    );

    this.ID = world.spriteLayer.add(
        doorRenderer,ZIndexBook.SpriteDoor
    );
    this.remove = () => world.spriteLayer.remove(this.ID);

    const setOpenCollision = () => {
        world.setCollisionTile(x,y,frame.topCollision);
        world.setCollisionTile(x,y+1,0);
        world.setCollisionTile(x,y+2,frame.bottomCollision);
    };
    const setClosedCollision = () => {
        world.setCollisionTile(x,y,frame.collision);
        world.setCollisionTile(x,y+1,frame.collision);
        world.setCollisionTile(x,y+2,frame.collision);
    };
    const setInteraction = value => {
        world.setInteractionTile(x,y,value);
        world.setInteractionTile(x,y+1,value);
        world.setInteractionTile(x,y+2,value);
    };

    let locked = false;
    const canChange = () => {
        const {closeStart,openStart} = doorRenderer;
        return !(locked || closeStart !== null || openStart !== null);
    };
    this.canChange = canChange;

    this.syncHandler = null;
    const fireSyncHandler = isGood => {
        if(!this.syncHandler) return;
        this.syncHandler({door:this,error:!isGood,success:isGood});
    };
    const fireGoodSyncHandler = () => fireSyncHandler(true);
    const fireBadSyncHandler = () => fireSyncHandler(false);

    const open = instant => {
        if(!canChange()) {
            fireBadSyncHandler();
            return false;
        }
        doorRenderer.open = true;

        if(instant) {
            setOpenCollision();
            fireGoodSyncHandler();
        } else {
            this.deferCollisionUpdate();
            doorRenderer.openStart = performance.now();
            (async () => {
                locked = true;
                await delay(duration);
                doorRenderer.openStart = null;
                setOpenCollision();
                world.pushCollisionChanges();
                locked = false;
                fireGoodSyncHandler();
            })();
        }

        return true;
    };
    const close = instant => {
        if(!canChange()) {
            fireBadSyncHandler();
            return false;
        }

        setClosedCollision();
        doorRenderer.open = false;

        if(instant) {
            fireGoodSyncHandler();
        } else {
            doorRenderer.closeStart = performance.now();
            (async () => {
                locked = true;
                await delay(duration);
                doorRenderer.closeStart = null;
                locked = false;
                fireGoodSyncHandler();
            })();
        }

        return true;
    };

    DoorBase.call(this,world,open,close,startOpen);
    doorRenderer.openStart = null, doorRenderer.closeStart = null;

    Object.defineProperty(this,"interactionValue",{
        value: typeof interactionValue === "number" ? interactionValue : null,
        writable: false, enumerable: true, configurable: false
    });

    if(this.interactionValue !== null) {
        interactionValue = this.interactionValue;
        this.tryInteract = ({value},callback) => {
            if(value !== interactionValue) return false;
            callback(this); return true;
        };
        setInteraction(interactionValue);
    }
}
export default SpriteDoor;
