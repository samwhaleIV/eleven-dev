import {
    MessageChain,
    DramaZoom,
    AddNamedBackground,
    SaveStone,
    GetLastTrigger,
    GetNextTrigger
} from "../helper.js";

const TALKED_KEY = "talkedToDemonGuyInHallway";

function HatHell(data) {
    if(data.hatStore) {
        HatStore.call(this,data); return;
    }

    const {world,lastScript,saveState,nextMap,fromStore} = data;

    world.setMap("hat-hell");
    world.camera.horizontalPadding = true;
    AddNamedBackground(world,"hell");

    if(lastScript === nextMap) {
        const player = world.addPlayer(18,5);
        player.direction = "left";
    } else if(fromStore) {
        const player = world.addPlayer(10,3);
        player.direction = "down";
    } else {
        const player = world.addPlayer(0,5);
        player.direction = "right";
    }

    const saveStone = new SaveStone(world,5,3);

    const talkToDemonGuy = async () => {
        if(saveState.get(TALKED_KEY)) {
            await world.say(saveState.get("player-hat")?
                "Hey! Nice hat. It suits you.":
                "Arise! Go forth and conquer!"
            );
        } else {
            world.playerController.lock();

            const dramaZoom = new DramaZoom(world,8.5,3);
            await dramaZoom.zoomIn();

            await MessageChain(world,[
                "Oh. Hey.", "You're still here?",
                "Usually no one makes it this far.",
                "You probably have a lot of questions.",
                "We still don't have time for them.",
                "I'm not really sure what I'm supposed to say now.",
                "Are you familiar with passageways?"
            ]);
            await delay(400);
            await world.prompt("Passageways?",["I'm somewhat familiar.","Passagewhat?"]);
            await delay(600);
            const messages = [
                "Yeah, you know.. Passageways!",
                "If you get stuck in a new area, passageways are magic.",
                "Passageways can make a room forget that you were even there!",
                "I, however, will remember this conversation forever because I am not a room.",
                "Plus, my new hat (that I definitely didn't steal) makes me much too important.",
                "Well it looks like we're out of time.",

            ];
            if(!saveState.get("player-hat")) {
                messages.push("The hat store might have some hats for you to try on.");
            } 
            await MessageChain(world,messages);

            await dramaZoom.zoomOut();
            world.playerController.unlock();
            saveState.set(TALKED_KEY,true);
        }
    };

    this.interact = data => {
        if(saveStone.tryInteract(data)) return;
        switch(data.value) {
            case 16: world.transition("HatStore"); break;
            case 17: talkToDemonGuy(); break;
            case 18: world.sayNamed("Hats are very clingy in hell.","Mysterious Lamp","r");
        }
    };

    let sadGoodbye = false;

    const dontKnowWhyYouSayGoodbyeISayHello = () => {
        if(!sadGoodbye && !saveState.get(TALKED_KEY)) {
            sadGoodbye = true;
            world.say("Wow. Leaving without even saying hello?");
        }
    };

    world.setTriggers([
        GetLastTrigger(world,1,"left"),
        GetNextTrigger(world,2,"right"),
        [3,dontKnowWhyYouSayGoodbyeISayHello]
    ]);
}
export default HatHell;
