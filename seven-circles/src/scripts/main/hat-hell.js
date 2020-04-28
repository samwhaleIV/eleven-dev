import MessageChain from "../helper/message-chain.js";
import DramaZoom from "../helper/drama-zoom.js";

const storeMap = "HatStore";
const previousMap = "ChocolateHell";
const nextMap = "RiverHell";

const talkedKey = "talkedToDemonGuyInHallway";

function HatHell({world,lastScript,saveState,transition}) {
    world.setMap("hat-hell");
    world.camera.padding = true;

    if(lastScript === nextMap) {
        const player = world.addPlayer(18,5);
        player.direction = "left";
    } else if(lastScript === storeMap) {
        const player = world.addPlayer(10,3);
        player.direction = "down";
    } else {
        const player = world.addPlayer(0,5);
        player.direction = "right";
    }

    const talkToDemonGuy = async () => {
        if(saveState.get(talkedKey)) {
            await world.say("Arise! Go forth and conquer!");
        } else {
            world.playerController.lock();

            const dramaZoom = new DramaZoom(world,8.5,3);
            await dramaZoom.zoomIn();

            await MessageChain(world,[
                "Oh. Hey.", "You're still here?",
                "Usually no one makes it this far.",
                "I'll let you in on a secret.",
                "We're in the first of the Seven Circles.",
                "You probably have a lot of questions, but like always we're running out of time.",
                "Although.. You know the passageways that take you from one place to another?"
            ]);
            await world.prompt("Passageways, what's the buzz?",["I'm somewhat familiar.","Passagewhat?"]);
            await delay(800);
            await MessageChain(world,[
                "Yeah, you know.. Passageways!",
                "I'll spill the beans. Like I said, we're running out time.",
                "If you get stuck in a new area, passageways are magic.",
                "Passageways can make a room forget that you were even there!",
                "I, however, will remember this conversation forever because I am not a room.",
                "Plus, my new hat (that I definitely didn't steal) makes me much too important.",
            ]);

            await dramaZoom.zoomOut();
            world.playerController.unlock();
            saveState.set(talkedKey,true);
        }
    };

    this.interact = ({value}) => {
        switch(value) {
            case 16: transition(storeMap); break;
            case 17: talkToDemonGuy(); break;
        }
    };

    let sadGoodbye = false;

    const dontKnowWhyYouSayGoodbyeISayHello = () => {
        if(!sadGoodbye && lastScript === previousMap && !saveState.get(talkedKey)) {
            sadGoodbye = true;
            world.say("Wow. Leaving without even saying hello?");
        }
    };

    world.setTriggerHandlers([
        [1,()=>{if(world.player.direction===3) transition(previousMap)},false],
        [2,()=>{if(world.player.direction===1) transition(nextMap)},false],
        [3,dontKnowWhyYouSayGoodbyeISayHello,false]
    ]);
}
export default HatHell;
