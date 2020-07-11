import {AddNamedBackground,MessageChain} from "../helper.js";

function GoodbyeHell({world}) {
    world.setMap("c1-hello");
    AddNamedBackground(world,"hell");
    world.addPlayer(4,4.125,"right");
    world.camera.scale *= 2;
    world.spriteFollower.disable();
    world.camera.x = 4.5;
    world.camera.y = 4;

    this.start = () => {
        (async () => {
            await delay(500);
            await MessageChain(world,[
                "You had a good run.",
                "Hell, I think you even set a new highscore.",
                "It was fun having you around.",
                "I'm sorry you died.",
                "I'm sorry the demo is over.",
                "Oh but we'll meet again.",
                "You'll see.",
                "They'll all see.",
                "HAHAHAHAHAHAHAHAHAHAHAHA!"
            ],["Mysterious Lamp","r"]);
            world.transitionNext(null,1000);
        })();
        return true;
    }
}
export default GoodbyeHell;

