const betterVerticalDoorCollision = {
    top: 25,
    bottom: 26,
    middle: 0
};

const KeyDoorFrames = {
    grayDoor: {
        vertical: true,
        color: "gray",
        top: 11,
        middle: 11,
        bottom: 11,
        topOpen: 12,
        bottomOpen: 13,
        collisionOpen: {
            top: 4,
            middle: 0,
            bottom: 5
        }
    },
    verticalRed: {
        vertical: true,
        color: "red",
        top: 777,
        middle: 841,
        bottom: 905,
        topOpen: 649,
        bottomOpen: 713,
        collisionOpen: betterVerticalDoorCollision
    },
    verticalBlue: {
        vertical: true,
        color: "blue",
        top: 775,
        middle: 839,
        bottom: 903,
        topOpen: 647,
        bottomOpen: 711,
        collisionOpen: betterVerticalDoorCollision
    },
    horizontalYellow: {
        vertical: false,
        color: "yellow",
        left: 842,
        middle: 843,
        right: 844,
        leftOpen: 845,
        rightOpen: 846
    },
    horizontalGreen: {
        vertical: false,
        color: "green",
        left: 906,
        middle: 907,
        right: 908,
        leftOpen: 909,
        rightOpen: 910
    },
    verticalPink: {
        vertical: true,
        color: "pink",
        top: 774,
        middle: 838,
        bottom: 902,
        topOpen: 646,
        bottomOpen: 710,
        collisionOpen: betterVerticalDoorCollision
    },
    verticalYellow: {
        vertical: true,
        color: "yellow",
        top: 773,
        middle: 837,
        bottom: 901,
        topOpen: 645,
        bottomOpen: 709,
        collisionOpen: betterVerticalDoorCollision
    },
    horizontalChocolate: {
        vertical: false,
        color: "chocolate",
        left: 778,
        middle: 779,
        right: 780,
        leftOpen: 781,
        rightOpen: 782
    }
};
export default KeyDoorFrames;
