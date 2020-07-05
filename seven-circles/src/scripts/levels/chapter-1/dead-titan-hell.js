import {GetLastTrigger,GetNextTrigger,PanPreview,SpriteDoor,DramaZoom,DarkRoom} from "../helper.js";
import MessageChain from "../../helper/director/message-chain.js";

function DeadTitanHell({world,fromNextMap,inventory}) {
    world.setMap("dead-titan-hell");
    world.camera.padding = true;
    if(fromNextMap) {
        world.addPlayer(10,6,"up");
    } else {
        world.addPlayer(16,3,"down");
    }

    DarkRoom(world);

    const exitDoor = new SpriteDoor(world,13,6,"grayDoor",false,1000,20);

    const removeTokenFromDemonGuy = () => {
        world.setForegroundTile(15,15,155);
    };
    if(fromNextMap) {
        removeTokenFromDemonGuy();
    }

    let gotToken = false;

    const killedTitanStory = async () => {
        world.playerController.lock();
        await frameDelay(600);
        const dramaZoom = new DramaZoom(world,15.5,15);
        await dramaZoom.zoomIn();
        await world.say("Hey. It's nice to see you again.");
        await frameDelay(1200);
        await world.say("Sorry about the mess.");
        await frameDelay(600);
        await MessageChain(world,[
            "You probably have a lot of questions but like always we don't have time for them.",
            "I'll make it brief.",
            "I know a quicker way for you to get your life back.",
            "What I have here is a fissure token.",
            "Getting them is a bit... Dirty.",
            "But you've already proven yourself worthy.",
            "I've tracked down a fissure nearby that will take you through a pocket dimension.",
            "Take this token and activate the fissure with it.",
            "From there, I can't really be of much help",
            "Not all pocket dimensions are created equal.",
            "I think, and this is just a guess, that it should be able to get you to your final destination."
        ]);
        await dramaZoom.zoomOut();
        world.playerController.unlock();
    };

    world.setTriggers([
        GetNextTrigger(world,2),
        [3,killedTitanStory,true],
        GetLastTrigger(world,1),
    ]);

    let talkedToButton = false, buttonPressed = false;

    this.interact = async ({value,x,y}) => {
        if(value === 17) {
            world.sayNamed("Something does not smell good here.","Mysterious Lamp","r");
        } else if(value === 18) {
            if(buttonPressed) {
                world.say("The button is stuck in this position forever.");
                return;
            }
            if(!gotToken) {
                if(talkedToButton) {
                    world.say("Didn't you hear me the first time?");
                    return;
                }
                await MessageChain(world,[
                    "Hey! Stop there!",
                    "I'm not your ordinary button.",
                    "I'm a button that makes sure you have all your necessary items before you leave."
                ]);
                talkedToButton = true;
            } else {
                world.playerController.lock();
                world.playSound("ButtonClick");
                world.setForegroundTile(x,y,547);
                buttonPressed = true;
                await frameDelay(500);
                await PanPreview({world,x:13,y:6.5,middleEvent:()=>{
                    exitDoor.open();
                }});
                world.playerController.unlock();
            }
        } else if(value === 16) {
            world.playerController.lock();
            await world.say("The token is yours. Fresh from the heart of the titan.");
            inventory.give("fissure-token",1);
            removeTokenFromDemonGuy();
            gotToken = true;
            await frameDelay(1000);
            await world.say("Good luck.");
            world.playerController.unlock();
        } else if(exitDoor.tryInteract({value},()=>{
            if(!exitDoor.opened) {
                world.message("The door is closed. Try to find a way to open it.");
            }
        })) {
            return;
        }
    }
}
export default DeadTitanHell;
