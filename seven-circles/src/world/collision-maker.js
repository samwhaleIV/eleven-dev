const {CollisionTypes} = Eleven;

const COLLISION_TYPE = CollisionTypes.Default;

const BAD_COLLISION_TYPE = type => {
    throw Error(`Collision type ${type} is not implemented!`);
};

const CollisionTable = Object.freeze([
    null,
    {
        width: 1,
        height: 1,
        x: 0,
        y: 0
    },
    {
        width: 0.5,
        height: 0.5,
        x: 0.5,
        y: 0.5,
    },
    {
        width: 0.5,
        height: 0.5,
        x: 0,
        y: 0.5
    },
    {
        width: 1,
        height: 0.5,
        x: 0,
        y: 0
    },
    {
        width: 1,
        height: 0.5,
        x: 0,
        y: 0.5
    },
    {
        width: 0.5,
        height: 0.5,
        x: 0.5,
        y: 0
    },
    {
        width: 0.5,
        height: 0.5,
        x: 0,
        y: 0
    },
    {
        width: 0.5,
        height: 1,
        x: 0.5,
        y: 0
    },
    {
        width: 0.5,
        height: 1,
        x: 0,
        y: 0
    },
    {
        width: 0.5,
        height: 1,
        x: 0.25,
        y: 0
    },
    {
        width: 1,
        height: 0.5,
        x: 0,
        y: 0.25
    },
    {
        width: 0.25,
        height: 0.25,
        x: 0.75,
        y: 0.75
    },
    {
        width: 0.25,
        height: 0.25,
        x: 0,
        y: 0.75
    },
    {
        width: 0.25,
        height: 0.25,
        x: 0.75,
        y: 0
    },
    {
        width: 0.25,
        height: 0.25,
        x: 0,
        y: 0
    },
    {
        x: 0.25,
        y: 0,
        height: 1,
        width: 0.75
    },
    {
        x: 0,
        y: 0,
        height: 1,
        width: 0.75
    },
    {
        x: 0.75,
        y: 0,
        height: 1,
        width: 0.25
    },
    {
        x: 0,
        y: 0,
        height: 1,
        width: 0.25
    },
    {
        x: 2 / 16,
        width: 12 / 16,
        height: 14 / 16,
        y: 2 / 16
    },
    {
        x: 2 / 16,
        width: 14 / 16,
        height: 1,
        y: 0
    },
    {
        x: 0,
        width: 14 / 16,
        height: 1,
        y: 0
    },
    {
        x: 2 / 16,
        width: 14 / 16,
        height: 14 / 16,
        y: 0.125
    },
    {
        x: 0,
        width: 14 / 16,
        height: 14 / 16,
        y: 2 / 16
    },
    {
        x: 0,
        width: 1,
        y: 0,
        height: 14 / 16
    },
    {
        x: 0,
        width: 1,
        y: 2 / 16,
        height: 14 / 16
    },
    {
        x: 0,
        width: 1,
        y: 12/16,
        height: 4/16
    },
    {
        x: 0,
        width: 1,
        y: 14/16,
        height: 2/16
    },
    {
        x: 0,
        width: 1,
        y: 13/16,
        height: 3/16
    },
    {
        x: 0,
        width: 4 / 16,
        y: 14/16,
        height: 2/16
    },
    {
        x: 12 / 16,
        width: 4 / 16,
        y: 14/16,
        height: 2/16
    },
    {
        x: 0,
        width: 10.5/16,
        y: 0,
        height: 1
    },
    {
        x: 5.5 / 16,
        width: 10.5/16,
        y: 0,
        height: 1
    }
]);

const finalIndex = CollisionTable.length - 1;

function CollisionMaker(x,y,value) {
    if(value < 1 || value > finalIndex) BAD_COLLISION_TYPE(value);

    const tableValue = CollisionTable[value];
    x += tableValue.x; y += tableValue.y;

    const {width,height} = tableValue;
    return {x,y,width,height,value,collisionType:COLLISION_TYPE};
}
export default CollisionMaker;
export {CollisionMaker, CollisionTable};
