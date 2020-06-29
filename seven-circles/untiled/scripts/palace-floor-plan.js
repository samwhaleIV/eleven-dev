import FloorPlan from "./floor-plan.js";

function PalaceFloorPlan(world) {
    FloorPlan({
        world,protoFloor:2,protoWall:1,
        background: 1043,

        eraseProtoWall: true,

        useInnerWallMatrix: true,
        useOuterWallMatrix: false,
        useShadowMatrix: false,

        wallTargetLayer: 0,

        shadowMatrix:[
            [74,75],
            [138,139]
        ],wallMatrix:{
            inner: {
                full: [
                    [1169,1170,1171],
                    [1233,1234,1235],
                    [1297,1298,1299]
                ],
                inverse: [
                    [1044,1045],
                    [1108,1109]
                ]
            }
        },
        floorValues:[1234]
    });
}
export default PalaceFloorPlan;
