import {GetTransitionTrigger, AddFixedWaterBackground} from "../helper.js";

const rooms = {
    "main": MainRoom,
    "roomOne": RoomOne,
    "roomTwo": RoomTwo,
    "roomThree": RoomThree
};

function setupMap(world,map,playerX,playerY,room,direction) {
    world.setMap(map);
    const player = world.addPlayer(playerX,playerY);
    player.direction = direction || "down";
    if(room) setReturnTrigger(world,room);
}
function getExitTrigger(world,room,ID) {
    return GetTransitionTrigger(world,ID,"DeadHell",null,{room:room});
}
function setReturnTrigger(world,room) {
    world.setTriggers([GetTransitionTrigger(world,1,"DeadHell",null,{room:"main",lastRoom:room})]);
}

function MainRoom({world,lastRoom}) {
    let position, direction = "up";
    switch(lastRoom) {
        default: position = [9.5,9]; direction = "down"; break;
        case "roomOne": position = [6,3]; break;
        case "roomTwo": position = [13,1]; break;
        case "roomThree": position = [13,9]; break;
    }
    setupMap(world,"dead-hell",...position,null,direction);
    world.setTriggers([
        getExitTrigger(world,"roomOne",1),
        getExitTrigger(world,"roomTwo",2),
        getExitTrigger(world,"roomThree",3)
    ]);
}

function RoomOne({world,room}) {
    setupMap(world,"dead-hell-1",3,1,room);
    world.camera.verticalPadding = true;
}
function RoomTwo({world,room}) {
    setupMap(world,"dead-hell-2",7,2,room);
    world.camera.verticalPadding = true;
    AddFixedWaterBackground(world,4,4,7,7);
}
function RoomThree({world,room}) {
    setupMap(world,"dead-hell-3",5,2,room);
    world.camera.verticalPadding = true;
}

function DeadHell(data) {
    rooms[data.room||"main"](data);
}
export default DeadHell;
