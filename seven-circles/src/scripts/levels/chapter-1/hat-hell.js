import {
    MessageChain,
    DramaZoom,
    AddNamedBackground,
    SaveStone,
    GetLastTrigger,
    GetNextTrigger
} from "../helper.js";
import Constants from "../../../constants.js";

const TALKED_KEY = "talkedToDemonGuyInHallway";

const EMPTY_HAT_STAND = 31;
const HELMET_STAND = 32;
const ALIEN_STAND = 33;
const RED_HAT_STAND = 95;
const HALO_STAND = 96;
const NO_HAT = "none";

function HatStore({world,saveState}) {
    world.setMap("hat-store");
    AddNamedBackground(world,"hell");

    const getStandSaveKey = ID => `hat-store-stand-${ID}`;

    const hatStands = [[1,5],[1,3],[2,1],[5,1],[6,3],[6,5]];
    const standKeys = {};

    const hatLookup = {
        [EMPTY_HAT_STAND]: NO_HAT,
        [HELMET_STAND]: "helmet",
        [RED_HAT_STAND]: "red-hat",
        [HALO_STAND]: "halo",
        [ALIEN_STAND]: "alien"
    };
    const inverseHatLookup = new Object();
    for(const [key,value] of Object.entries(hatLookup)) {
        inverseHatLookup[value] = key;
    }
    inverseHatLookup[NO_HAT] = EMPTY_HAT_STAND;

    const hashXY = (x,y) => `${x},${y}`;

    for(let i = 0;i<hatStands.length;i++) {
        const [x,y] = hatStands[i];
        const saveKey = getStandSaveKey(i);
        const storedHat = saveState.get(saveKey);
        standKeys[hashXY(x,y)] = saveKey;
        if(!storedHat) continue;
        world.setForegroundTile(x,y,inverseHatLookup[storedHat]);
    }

    const player = world.addPlayer(3.5,8);
    player.direction = "up";

    const getCurrentHat = () => {
        const currentHat = saveState.get("player-hat");
        if(!currentHat) return NO_HAT;
        return currentHat;
    };

    const setHat = name => {
        player.texture = Eleven.ResourceManager.getImage(
            name ? `player/${name}` : Constants.PlayerSprite
        );
        saveState.set("player-hat",name);
    };

    const badSwap = () => {
        world.message("You can't put this kind of hat here.");
    };
    const cantSwap = () => {
        world.message("There's no hat here.");
    };

    const swapHat = (x,y) => {
        const value = world.getForegroundTile(x,y);
        let newValue = value;

        const currentHat = getCurrentHat();
        const emptyStand = value === EMPTY_HAT_STAND;
        const hasHat = currentHat !== NO_HAT;

        if(emptyStand) {
            if(hasHat) {
                setHat(null);
                newValue = inverseHatLookup[currentHat];
                if(!newValue) {
                    badSwap(); return;
                }
            } else {
                cantSwap(); return;
            }
        } else {
            if(hasHat) {
                setHat(hatLookup[value]);
                newValue = inverseHatLookup[currentHat];
                if(!newValue) {
                    badSwap(); return;
                }
            } else {
                setHat(hatLookup[value]);
                newValue = EMPTY_HAT_STAND;
            }
        }

        const saveValue = hatLookup[newValue];
        saveState.set(standKeys[hashXY(x,y)],saveValue);
        world.setForegroundTile(x,y,newValue);
    };

    this.interact = ({value,x,y}) => {
        if(value === 16) {
            world.transition(HatHell,{fromStore:true});
        } else if(value === 17) {
            swapHat(x,y);
        } else if(value === 18) {
            world.message("Christmas hats won't fit you.");
        } else if(value === 19) {
            world.say("Hey! Feel free to try on any hat you want!");
        }
    };
}

function HatHell(data) {
    if(data.hatStore) {
        HatStore.call(this,data); return;
    }

    const {world,lastScript,saveState,lastMap,nextMap,fromStore} = data;

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
                1000,
                "Usually no one makes it this far.",
                "You probably have a lot of questions but we don't have time for them.",
                1000,
                "I'm not really sure what I'm supposed to say now.",
                600,
                "Are you familiar with passageways?"
            ]);
            await world.prompt("Passageways?",["I'm somewhat familiar.","Passagewhat?"]);
            await delay(800);
            await MessageChain(world,[
                "Yeah, you know.. Passageways!",
                "If you get stuck in a new area, passageways are magic.",
                "Passageways can make a room forget that you were even there!",
                "I, however, will remember this conversation forever because I am not a room.",
                "Plus, my new hat (that I definitely didn't steal) makes me much too important.",
                1000,
                "Well it looks like we're out of time, but the hat store might still have some hats for you to try on."
            ]);

            await dramaZoom.zoomOut();
            world.playerController.unlock();
            saveState.set(TALKED_KEY,true);
        }
    };

    this.interact = data => {
        if(saveStone.tryInteract(data)) return;
        switch(data.value) {
            case 16: world.transition(HatHell,{hatStore:true}); break;
            case 17: talkToDemonGuy(); break;
            case 18: world.sayNamed("Hats are very clingy in hell.","Mysterious Lamp");
        }
    };

    let sadGoodbye = false;

    const dontKnowWhyYouSayGoodbyeISayHello = () => {
        if(!sadGoodbye && lastScript === lastMap && !saveState.get(TALKED_KEY)) {
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
