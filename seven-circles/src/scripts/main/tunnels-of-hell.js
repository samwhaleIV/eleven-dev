import KeyDoor from "../helper/key-door.js";
import StaticPickup from "../helper/static-pickup.js";
import KeyDoorHandler from "../helper/key-door-handler.js";

const BACKGROUND_COLOR = `rgb(20,0,0)`;

function TunnelsOfHell(world) {
    world.setMap("tunnels-of-hell");
    const player = world.addPlayer(4,3.5);
    player.direction = "down";
    world.dispatchRenderer.addBackground((context,{width,height})=>{
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0,0,width,height);
    });

    const doors = [
        new KeyDoor({world,frame:"verticalRed",x:8,y:14}),
        new KeyDoor({world,frame:"verticalYellow",x:6,y:8}),
        new KeyDoor({world,frame:"verticalBlue",x:25,y:13}),
        new KeyDoor({world,frame:"horizontalGreen",x:20,y:2}),
        new KeyDoor({world,frame:"horizontalGreen",x:48,y:6}),
        new KeyDoor({world,frame:"horizontalYellow",x:37,y:5}),
        new KeyDoor({world,frame:"verticalPink",x:52,y:8}),
    ];
    this.useKey = KeyDoorHandler(world,doors);

    const keys = [
        new StaticPickup(world,4,15,"red-key"),
        new StaticPickup(world,8,9,"green-key"),
        new StaticPickup(world,21,1,"pink-key"),
        new StaticPickup(world,30,3,"blue-key"),
        new StaticPickup(world,49,13,"yellow-key")
    ];
    this.interact = ({value}) => {
        switch(value) {
            case 32: keys[0].grab(); break;
            case 33: keys[1].grab(); break;
            case 34: keys[2].grab(); break;
            case 35: keys[3].grab(); break;
            case 36: keys[4].grab(); break;
        }
    };
}
export default TunnelsOfHell;
