import FloorPlan from "./floor-plan.js";

function HellFloorPlan(world) {
    FloorPlan({
        world,protoFloor:2,protoWall:1,
        background: 128,
        shadowMatrix:[
            [74,75],
            [138,139]
        ],wallMatrix:{
            outer: {
                full: [
                    [607,608,609],
                    [671,672,673],
                    [735,736,737]
                ],
                inverse: [
                    [801,802],
                    [865,866]
                ]
            },
            inner: {
                full: [
                    [732,733,734],
                    [796,797,798],
                    [860,861,862]
                ],
                inverse: [
                    [799,800],
                    [863,864]
                ]
            }
        },floorValues:[71,72,135,136]
    });
}
export default HellFloorPlan;
