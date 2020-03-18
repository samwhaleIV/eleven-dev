const {CollisionTypes} = Eleven;

const COLLISION_TYPE = CollisionTypes.Default;

const BAD_COLLISION_TYPE = type => {
    throw Error(`Collision type ${type} is not implemented!`);
};

const table = Object.freeze({
    1: {
        width: 1,
        height: 1,
        x: 0,
        y: 0
    },
    2: {
        width: 0.5,
        height: 0.5,
        x: 0.5,
        y: 0.5,
    },
    3: {
        width: 0.5,
        height: 0.5,
        x: 0,
        y: 0.5
    },
    4: {
        width: 1,
        height: 0.5,
        x: 0,
        y: 0
    },
    5: {
        width: 1,
        height: 0.5,
        x: 0,
        y: 0.5
    },
    6: {
        width: 0.5,
        height: 0.5,
        x: 0.5,
        y: 0
    },
    7: {
        width: 0.5,
        height: 0.5,
        x: 0,
        y: 0
    },
    8: {
        width: 0.5,
        height: 1,
        x: 0.5,
        y: 0
    },
    9: {
        width: 0.5,
        height: 1,
        x: 0,
        y: 0
    },
    10: {
        width: 0.5,
        height: 1,
        x: 0.25,
        y: 0
    },
    11: {
        width: 1,
        height: 0.5,
        x: 0,
        y: 0.25
    },
    12: {
        width: 0.25,
        height: 0.25,
        x: 0.75,
        y: 0.75
    },
    13: {
        width: 0.25,
        height: 0.25,
        x: 0,
        y: 0.75
    },
    16: {
        width: 0.25,
        height: 0.25,
        x: 0.75,
        y: 0
    },
    17: {
        width: 0.25,
        height: 0.25,
        x: 0,
        y: 0
    },
    14: {
        x: 0.25,
        y: 0,
        height: 1,
        width: 0.75
    },
    15: {
        x: 0,
        y: 0,
        height: 1,
        width: 0.75
    },
    18: {
        x: 0.75,
        y: 0,
        height: 1,
        width: 0.25
    },
    19: {
        x: 0,
        y: 0,
        height: 1,
        width: 0.25
    },
    20: {
        x: 2 / 16,
        width: 12 / 16,
        height: 14 / 16,
        y: 2 / 16
    },
    22: {
        x: 2 / 16,
        width: 14 / 16,
        height: 1,
        y: 0
    },
    23: {
        x: 0,
        width: 14 / 16,
        height: 1,
        y: 0
    },
    26: {
        x: 2 / 16,
        width: 14 / 16,
        height: 14 / 16,
        y: 0.125
    },
    27: {
        x: 0,
        width: 14 / 16,
        height: 14 / 16,
        y: 2 / 16
    }
});

function CollisionMaker(x,y,value) {
    if(!(value in table)) BAD_COLLISION_TYPE(value);
    const tableValue = table[value];
    x += tableValue.x; y += tableValue.y;
    const {width,height} = tableValue;
    return {x,y,width,height,value,collisionType:COLLISION_TYPE};
}
export default CollisionMaker;
