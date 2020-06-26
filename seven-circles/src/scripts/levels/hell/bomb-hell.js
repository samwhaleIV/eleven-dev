import {MapNuke,GetNextTrigger,GetLastTrigger} from "../helper.js";

function BombHell({world,fromNextMap}) {
    world.setMap("bomb-hell");
    if(!fromNextMap) {
        world.addPlayer(0,8,"right");
    } else {
        world.addPlayer(41,6,"left");
    }
    const {player} = world;
    world.camera.padding = true;

    const hahaBombsGoBoom = async () => {
        world.playerController.lock();
        const {spriteFollower,camera} = world;
        spriteFollower.disable();
        camera.moveTo(5,5,600);
        camera.zoomTo(camera.scale*19,3000);
        world.disableInput();
        world.say("Noooooooooooooo!");
        await delay(1200);
        MapNuke(world);
    };

    let temptedFate = false;

    this.interact = ({value,x,y}) => {
        if(value === 19) {
            if(!temptedFate) {
                world.sayNamed("I wouldn't do that if I were you.","Mysterious Lamp","r");
                temptedFate = true;
                return;
            }
            hahaBombsGoBoom();
        } else if(value === 20) {
            world.sayNamed("This looks like a sticky situation.","Mysterious Lamp","r");
        } else if(value === 17) {
            world.say("You gotta get me out of here!");
        } else if(value === 16) {
            world.say("Help! I need somebody help!");
        } else if(value === 18) {
            world.say("Mind your own hellswax.");
        }
    };

    world.setTriggers([
        GetLastTrigger(world,1,"left"),
        GetNextTrigger(world,2,"right")
    ]);
}
export default BombHell;
