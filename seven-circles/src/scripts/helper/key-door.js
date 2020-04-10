const verticalCollisionValue = 9;
const horizontalCollisionValue = 1;

const frames = {
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

const defaultFrame = frames.verticalRed;

const verticalOpen = (x,y,world,frame) => {
    world.setForegroundTile(x,y,frame.topOpen);
    world.setForegroundTile(x,y+1,0);
    world.setForegroundTile(x,y+2,frame.bottomOpen);

    world.setCollisionTile(x,y,verticalCollisionValue);
    world.setCollisionTile(x,y+1,0);
    world.setCollisionTile(x,y+2,verticalCollisionValue);

    world.pushCollisionChanges();
};
const verticalClose = (x,y,world,frame) => {
    world.setForegroundTile(x,y,frame.top);
    world.setForegroundTile(x,y+1,frame.middle);
    world.setForegroundTile(x,y+2,frame.bottom);

    world.setCollisionTile(x,y,verticalCollisionValue);
    world.setCollisionTile(x,y+1,verticalCollisionValue);
    world.setCollisionTile(x,y+2,verticalCollisionValue);

    world.pushCollisionChanges();
};
const horizontalOpen = (x,y,world,frame) => {
    world.setForegroundTile(x,y,frame.leftOpen);
    world.setForegroundTile(x+1,y,0);
    world.setForegroundTile(x+2,y,frame.rightOpen);

    world.setCollisionTile(x,y,horizontalCollisionValue);
    world.setCollisionTile(x+1,y,0);
    world.setCollisionTile(x+2,y,horizontalCollisionValue);

    world.pushCollisionChanges();
};
const horizontalClose = (x,y,world,frame) => {
    world.setForegroundTile(x,y,frame.left);
    world.setForegroundTile(x+1,y,frame.middle);
    world.setForegroundTile(x+2,y,frame.right);

    world.setCollisionTile(x,y,horizontalCollisionValue);
    world.setCollisionTile(x+1,y,horizontalCollisionValue);
    world.setCollisionTile(x+2,y,horizontalCollisionValue);
};

function KeyDoor({
    world, frame = defaultFrame,
    x = 0, y = 0, interactionType = null
}) {
    if(typeof frame === "string") {
        frame = frames[frame];
    }
    let opened = false;
    Object.defineProperty(this,"opened",{
        get: () => opened,
        enumerable: true
    });
    this.open = () => {
        if(opened) return;
        if(frame.vertical) {
            verticalOpen(x,y,world,frame);
        } else {
            horizontalOpen(x,y,world,frame);
        }
        opened = true;
    };
    this.close = () => {
        if(!opened) return;
        if(frame.vertical) {
            verticalClose(x,y,world,frame);
        } else {
            horizontalClose(x,y,world,frame);
        }
        opened = false;
    };
    this.color = frame.color || null;

    if(interactionType !== null) {
        if(frame.vertical) {
            world.setInteractionTile(x,y,interactionType);
            world.setInteractionTile(x,y+1,interactionType);
            world.setInteractionTile(x,y+2,interactionType);
        } else {
            world.setInteractionTile(x,y,interactionType);
            world.setInteractionTile(x+1,y,interactionType);
            world.setInteractionTile(x+2,y,interactionType);
        }
        world.pushInteractionChanges();
    }

    this.interactionValue = world.getInteractionTile(x,y);

    opened = true; this.close();
}
export default KeyDoor;
