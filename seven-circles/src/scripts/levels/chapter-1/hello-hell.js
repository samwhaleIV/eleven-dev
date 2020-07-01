import {AddNamedBackground,MessageChain} from "../helper.js";

function HelloHell({world}) {
    world.setMap("hello-hell");
    AddNamedBackground(world,"hell");
    world.addPlayer(4,4.125,"right");
    world.camera.scale *= 2;
    world.spriteFollower.disable();
    world.camera.x = 4.5;
    world.camera.y = 4;

    this.start = () => {
        (async () => {
            await delay(750);
            await MessageChain(world,[
                "You're in my domain now.",
                "You're going to have SO much fun here.",
                "You're my favorite.",
                "HAHAHAHAHAHAHAHAHAHAHAHA!",
                "And away we go.."
            ],["Mysterious Lamp","r"]);
            world.transitionNext(null,1000);
        })();
        return true;
    }
}
export default HelloHell;
