import {
    GetTransitionTrigger,
    AddFixedWaterBackground,
    DarkRoom,
    RiverRocks
} from "../helper.js";
import Lantern from "../../weapons/lantern.js";

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

const clearPowerCell = (world,x,y,pushChanges=true) => {
    world.setInteractionTile(x,y,0);
    world.setCollisionTile(x,y,0);
    world.setForegroundTile(x,y,0);
    world.setSuperForegroundTile(x,y,0);
    if(pushChanges) world.pushTileChanges();
};


function MainRoom({world,lastRoom,saveState,inventory}) {
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

    if(saveState.get("dead-hell-cell")) {
        clearPowerCell(world,6,17,false);
    }
    this.interact = ({value,x,y}) => {
        if(value === 18) {
            clearPowerCell(world,x,y);
            inventory.give("power-cell");
            saveState.set("dead-hell-cell",true);
        }
    };
}

function RoomOne({world,room}) {
    setupMap(world,"dead-hell-1",3,1,room);
    world.camera.verticalPadding = true;
}
function RoomTwo({world,room,inventory,saveState}) {
    setupMap(world,"dead-hell-2",7,2,room);
    world.camera.verticalPadding = true;
    const rocks = new RiverRocks(world,this);
    if(saveState.get("dead-hell-2-cell")) {
        clearPowerCell(world,7,7,false);
    }
    this.interact = data => {
        if(rocks.tryPickup(data)) return;
        const {value,x,y} = data;
        if(value === 16) {
            clearPowerCell(world,x,y);
            inventory.give("power-cell");
            saveState.set("dead-hell-2-cell",true);
        }

    }
    AddFixedWaterBackground(world,4,4,7,7);
}
function RoomThree({world,room,inventory,saveState}) {
    setupMap(world,"dead-hell-3",5,2,room);
    DarkRoom(world);
    const {player} = world;

    if(saveState.get("dead-hell-3-cell")) {
        clearPowerCell(world,4,56,false);
    }

    this.interact = ({value,x,y}) => {
        if(value === 16) {
            const currentWeapon = player.getWeapon();
            if(currentWeapon && currentWeapon.name === Lantern.name) {
                player.unlockWeapon();
                player.clearWeapon();
            } else {
                player.setWeapon(Lantern);
                player.lockWeapon();
            }
        } else if(value === 17) {
            clearPowerCell(world,x,y);
            saveState.set("dead-hell-3-cell",true);
            inventory.give("power-cell");
        }
    };
    world.camera.verticalPadding = true;
}

function DeadHell(data) {
    rooms[data.room||"main"].call(this,data);
}
export default DeadHell;
