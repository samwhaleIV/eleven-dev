import KeyDoorHandler from "./key-door-handler.js"
import GetInteractionStart from "../get-interaction-start.js";
import DoorBase from "./door-base.js";
import KeyDoorFrames from "./key-door-frames.js";

const INTERACTION_ID_START = GetInteractionStart();
const VERTICAL_COLLISION_VALUE = 1;
const HORIZONTAL_COLLISION_VALUE = 1;

const defaultVerticalCollision = {
    top: VERTICAL_COLLISION_VALUE,
    middle: 0,
    bottom: VERTICAL_COLLISION_VALUE
};

const verticalOpen = (x,y,world,frame) => {
    world.setForegroundTile(x,y,frame.topOpen);
    world.setForegroundTile(x,y+1,0);
    world.setForegroundTile(x,y+2,frame.bottomOpen);

    const collision = frame.collisionOpen || defaultVerticalCollision;

    world.setCollisionTile(x,y,collision.top);
    world.setCollisionTile(x,y+1,collision.middle);
    world.setCollisionTile(x,y+2,collision.bottom);
};
const verticalClose = (x,y,world,frame) => {
    world.setForegroundTile(x,y,frame.top);
    world.setForegroundTile(x,y+1,frame.middle);
    world.setForegroundTile(x,y+2,frame.bottom);

    const collision = frame.collision || VERTICAL_COLLISION_VALUE;

    world.setCollisionTile(x,y,collision);
    world.setCollisionTile(x,y+1,collision);
    world.setCollisionTile(x,y+2,collision);
};
const horizontalOpen = (x,y,world,frame) => {
    world.setForegroundTile(x,y,frame.leftOpen);
    world.setForegroundTile(x+1,y,0);
    world.setForegroundTile(x+2,y,frame.rightOpen);

    world.setCollisionTile(x,y,HORIZONTAL_COLLISION_VALUE);
    world.setCollisionTile(x+1,y,0);
    world.setCollisionTile(x+2,y,HORIZONTAL_COLLISION_VALUE);
};
const horizontalClose = (x,y,world,frame) => {
    world.setForegroundTile(x,y,frame.left);
    world.setForegroundTile(x+1,y,frame.middle);
    world.setForegroundTile(x+2,y,frame.right);

    world.setCollisionTile(x,y,HORIZONTAL_COLLISION_VALUE);
    world.setCollisionTile(x+1,y,HORIZONTAL_COLLISION_VALUE);
    world.setCollisionTile(x+2,y,HORIZONTAL_COLLISION_VALUE);
};

const installInteraction = (x,y,world,frame,type) => {
    if(frame.vertical) {
        world.setInteractionTile(x,y,type);
        world.setInteractionTile(x,y+1,type);
        world.setInteractionTile(x,y+2,type);
    } else {
        world.setInteractionTile(x,y,type);
        world.setInteractionTile(x+1,y,type);
        world.setInteractionTile(x+2,y,type);
    }
};

const open = (x,y,world,frame) => {
    if(frame.vertical) {
        verticalOpen(x,y,world,frame);
    } else {
        horizontalOpen(x,y,world,frame);
    }
    return true;
};
const close = (x,y,world,frame) => {
    if(frame.vertical) {
        verticalClose(x,y,world,frame);
    } else {
        horizontalClose(x,y,world,frame);
    }
    return true;
};

function KeyDoor(world,x,y,frame,startOpen,interactionValue) {
    if(typeof frame === "string") {
        frame = KeyDoorFrames[frame];
    }
    if(!frame) frame = KeyDoorFrames.grayDoor;

    this.color = frame.color || null;

    if(!isNaN(interactionValue) && interactionValue !== null) installInteraction(
        x,y,world,frame,interactionValue
    );
    this.interactionValue = world.getInteractionTile(x,y);

    const openTarget = open.bind(null,x,y,world,frame);
    const closeTarget = close.bind(null,x,y,world,frame);

    DoorBase.call(this,world,openTarget,closeTarget,startOpen);
}

function getDoors(world,script,doors,IDStart) {
    if(isNaN(IDStart)) IDStart = INTERACTION_ID_START;

    const keyDoors = new Array(doors.length);

    for(let i = 0;i<doors.length;i++) {
        let [x,y,frame,interactionValue] = doors[i];
        if(interactionValue === undefined) {
            interactionValue = IDStart;
            IDStart++;
        }
        keyDoors[i] = new KeyDoor(
            world,x,y,frame,false,interactionValue
        );
    }

    const keyHandler = KeyDoorHandler(world,keyDoors);

    const tryInteract = ({value}) => {
        for(let i = 0;i<doors.length;i++) {
            const keyDoor = keyDoors[i];
            if(value === keyDoor.interactionValue) {
                if(!keyDoor.opened) world.message(
                    `You need a ${keyDoor.color} key to open this door!`
                );
                return true;
            }
        }
        return false;
    };

    const get = index => keyDoors[index];
    const count = keyDoors.length;
    script.useKey = keyHandler;

    return Object.freeze({get,tryInteract,count});
}

Object.defineProperty(KeyDoor,"getDoors",{
    value: getDoors,
    enumerable: true,
    configurable: false,
    writable: false
});

export default KeyDoor;
