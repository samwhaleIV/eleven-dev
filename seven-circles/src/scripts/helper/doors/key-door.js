import KeyDoorHandler from "./key-door-handler.js"
import GetInteractionStart from "../get-interaction-start.js";
import DoorBase from "./door-base.js";

const INTERACTION_ID_START = GetInteractionStart();
const VERTICAL_COLLISION_VALUE = 9;
const HORIZONTAL_COLLISION_VALUE = 1;

const frames = {
    grayDoor: {
        vertical: true,
        color: "gray",
        top: 11,
        middle: 11,
        bottom: 11,
        topOpen: 12,
        bottomOpen: 13,
        collision: 1,
        collisionOpen: {
            top: 4,
            middle: 0,
            bottom: 5
        }
    },
    verticalRed: {
        vertical: true,
        color: "red",
        top: 392,
        middle: 456,
        bottom: 520,
        topOpen: 584,
        bottomOpen: 648
    },
    verticalBlue: {
        vertical: true,
        color: "blue",
        top: 457,
        middle: 521,
        bottom: 585,
        topOpen: 649,
        bottomOpen: 713
    },
    horizontalYellow: {
        vertical: false,
        color: "yellow",
        left: 393,
        middle: 394,
        right: 395,
        leftOpen: 711,
        rightOpen: 712
    },
    horizontalGreen: {
        vertical: false,
        color: "green",
        left: 396,
        middle: 397,
        right: 398,
        leftOpen: 775,
        rightOpen: 776
    },
    verticalPink: {
        vertical: true,
        color: "pink",
        top: 399,
        middle: 463,
        bottom: 527,
        topOpen: 777,
        bottomOpen: 841
    },
    verticalYellow: {
        vertical: true,
        color: "yellow",
        top: 400,
        middle: 464,
        bottom: 528,
        topOpen: 401,
        bottomOpen: 465
    }
};

const FALLBACK_FRAME = frames.verticalRed;
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
        frame = frames[frame];
    }
    if(!frame) frame = FALLBACK_FRAME;

    this.color = frame.color || null;

    if(!isNaN(interactionValue) && interactionValue !== null) installInteraction(
        x,y,world,frame,interactionValue
    );
    this.interactionValue = world.getInteractionTile(x,y);

    const openTarget = open.bind(null,x,y,world,frame);
    const closeTarget = close.bind(null,x,y,world,frame);

    DoorBase.call(this,world,openTarget,closeTarget,startOpen);
}

function getDoors(world,doors,IDStart) {
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

    return Object.freeze({get,useKey:keyHandler,tryInteract,count});
}

Object.defineProperty(KeyDoor,"getDoors",{
    value: getDoors,
    enumerable: true,
    configurable: false,
    writable: false
});

export default KeyDoor;
