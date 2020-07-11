import Constants from "../../../constants.js";
import {
    AddNamedBackground
} from "../helper.js";

const EMPTY_HAT_STAND = 31;
const HELMET_STAND = 32;
const ALIEN_STAND = 33;
const RED_HAT_STAND = 95;
const HALO_STAND = 96;
const NO_HAT = "none";

function HatStore({world,saveState}) {
    world.setMap("c1-hat-store");
    AddNamedBackground(world,"hell");

    const getStandSaveKey = ID => `hat-store-stand-${ID}`;

    const hatStands = [[1,5],[1,3],[2,2],[5,2],[6,3],[6,5]];
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

    const player = world.addPlayer(3.5,7.75);
    player.direction = "up";

    const getCurrentHat = () => {
        const currentHat = saveState.get("player-hat");
        if(!currentHat) return NO_HAT;
        return currentHat;
    };

    const setHat = name => {
        if(name) {
            world.playSound("RemovedHat");
        } else {
            world.playSound("SwapHat");
        }
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
            world.transition("HatHell",{fromStore:true});
        } else if(value === 17) {
            swapHat(x,y);
        } else if(value === 18) {
            world.message("Christmas hats won't fit you.");
        } else if(value === 19) {
            world.say("Hey! Feel free to try on any hat you want!");
        }
    };
}

export default HatStore;
