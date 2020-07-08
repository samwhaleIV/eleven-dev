import {MapNuke,GetNextTrigger,GetLastTrigger,ObjectiveText,SpriteDoor} from "../helper.js";

const COUNTDOWN_TIME = 120;
const SNIPPED_TEXTURE_ID = 483;
const SNIP_COUNT = 4;
const SNIPPED_INTERACTION_ID = 32;
const DOOR_INTERACTION_ID = 33;

function BombHell({world,fromNextMap}) {
    world.setMap("bomb-hell");
    world.camera.padding = true;
    const objective = new ObjectiveText(world);

    let secondsRemaining = COUNTDOWN_TIME;
    const setObjectiveTimer = () => {
        objective.text = ["Prevent the trap from detonating!",`${secondsRemaining} second${secondsRemaining !== 1 ? "s" : ""}`];
    };

    const spriteDoor = new SpriteDoor(world,37,5,"grayDoor",false,1000,DOOR_INTERACTION_ID);

    if(!fromNextMap) {
        world.addPlayer(0,8,"right");
        objective.status = "disable-trap";
    } else {
        world.addPlayer(41,6,"left");
    }

    let terminated = false;
    this.unload = () => terminated = true;

    const hahaBombsGoBoom = async () => {
        terminated = true;
        world.disableInput();
        world.playerController.lock();
        while(world.canAdvanceMessage()) world.advanceMessage();
        const {spriteFollower,camera} = world;
        spriteFollower.disable();
        camera.moveTo(5,5,600);
        camera.zoomTo(camera.scale*19,3000);
        world.say("Noooooooooooooo!");
        await delay(1200);
        MapNuke(world,objective);
    };

    if(objective.status === "disable-trap") this.start = () => {
        setObjectiveTimer();
        let intervalID = null;
        const cancelTimer = () => {
            clearInterval(intervalID);
        };
        intervalID = setInterval(()=>{
            if(terminated) {
                cancelTimer();
                return;
            }
            secondsRemaining -= 1;
            if(secondsRemaining >= 0) {
                setObjectiveTimer();
                return;
            }
            hahaBombsGoBoom();
            cancelTimer();
        },1000);
        return false;
    };

    let temptedFate = false;

    let snippedCount = 0;

    const saveTheDay = async () => {
        world.playerController.lock();
        terminated = true;
        objective.close();
        world.spriteFollower.disable();
        world.camera.zoomTo(world.camera.scale*2,1000);
        await world.camera.moveTo(6,4.5,1000);
        await world.say("What have you done to my wires! My boss is going to kill me. As if I wasn't dead enough!");
        await world.camera.moveTo(37,6,1000);
        spriteDoor.open();
        await delay(1500);
        world.camera.zoomTo(world.camera.scale/2,1000);
        await world.camera.moveTo(world.player,1000);
        world.spriteFollower.enable();
        world.playerController.unlock();
    };

    const dayIsSaved = () => snippedCount >= SNIP_COUNT;

    const animateButtonPress = async (x,y) => {
        world.playSound("ButtonClick");
        const startTile = world.getForegroundTile(x,y);
        world.setForegroundTile(x,y,547);
        await delay(500);
        if(terminated) return;
        world.setForegroundTile(x,y,startTile);
    };

    this.interact = data => {
        const {value,x,y} = data;
        if(value === 19) {
            if(dayIsSaved()) {
                animateButtonPress(x,y);
                world.message("The button is no longer operational.");
                return;
            }
            if(!temptedFate) {
                world.sayNamed("I wouldn't do that if I were you.","Mysterious Lamp","r");
                temptedFate = true;
                return;
            }
            animateButtonPress(x,y);
            hahaBombsGoBoom();
        }  else if(value === SNIPPED_INTERACTION_ID) {
            if(world.getForegroundTile(x,y) === SNIPPED_TEXTURE_ID) return;
            world.setForegroundTile(x,y,SNIPPED_TEXTURE_ID);
            snippedCount += 1;
            world.playSound("WireSnipped");
            if(dayIsSaved()) {
                saveTheDay();
            } else {
                const oneSnipLeft = snippedCount === SNIP_COUNT - 1;
                const message = oneSnipLeft ? "There's probably just one more!" : "You broke the patch on the wire. Are there more?";
                world.message(message);
            }
        } else if(value === 20) {
            world.sayNamed("This looks like a sticky situation.","Mysterious Lamp","r");
        } else if(value === 17) {
            world.say(dayIsSaved() ? "You know I kinda like it in here." : "You gotta get me out of here!");
        } else if(value === 16) {
            world.say(dayIsSaved() ? "Because if you I'm not going to explode." : "Help! I need somebody help!");
        } else if(value === 18) {
            world.say(dayIsSaved() ? "I really botched this up." : "My wires are infalliable most of the time!");
        } else if(value === 24) {
            world.message("Small writing is visible on the bombs instructing you to not bring fire to them.");
        }
        if(spriteDoor.tryInteract(data,()=>{
            if(spriteDoor.opened) return;
            world.message("The door won't open until you've saved the day!");
        })) return;
    };

    world.setTriggers([
        GetLastTrigger(world,1,"left"),
        GetNextTrigger(world,2,"right")
    ]);
}
export default BombHell;
