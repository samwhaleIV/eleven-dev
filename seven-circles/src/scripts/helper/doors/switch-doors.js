import GetInteractionStart from "../self/get-interaction-start.js";
import SpriteDoor from "./sprite-door/sprite-door.js";

const INCONSPICUOUS_ERROR_MESSAGE = "Try to keep your doors in sync ;)";

const INTERACTION_ID_START = GetInteractionStart();
const TOGGLE_DURATION = 150;

const frameLookup = {
    "red":"redSwitchDoor",
    "blue":"blueSwitchDoor",
    "yellow":"yellowSwitchDoor"
};

const switchForegrounds = {
    397:398,398:397,
    272:273,273:272,
    336:337,337:336
};

function SwitchDoors(world,doors,switches) {

    const doorLookup = {}, switchLookup = {};

    const switchLocations = {};

    const clearForegroundForDoor = (x,y) => {
        world.setForegroundTile(x,y,0);
        world.setForegroundTile(x,y+1,0);
        world.setForegroundTile(x,y+2,0);
    };

    for(let i = 0;i<doors.length;i++) {
        const [x,y,color,open] = doors[i];
        const door = new SpriteDoor(
            world,x,y,frameLookup[color],
            open,TOGGLE_DURATION,null
        );
        if(!(color in doorLookup)) {
            doorLookup[color] = new Array();
        }
        clearForegroundForDoor(x,y);
        doorLookup[color].push(door);
    }

    for(let i = 0;i<switches.length;i++) {
        const [x,y,color] = switches[i];
        const interactionID = INTERACTION_ID_START + i;
        world.setInteractionTile(x,y,interactionID);
        world.setCollisionTile(x,y,1);
        if(!(color in switchLocations)) {
            switchLocations[color] = new Array();
        }
        switchLocations[color].push([x,y]);
        switchLookup[interactionID] = color;
    }

    const switchStates = {};

    this.tryInteract = ({value}) => {
        if(value in switchLookup) {
            const color = switchLookup[value];

            if(color in switchStates) return false;

            const doors = doorLookup[color];
            switchStates[color] = doors.length;

            for(let i = 0;i<doors.length;i++) {
                const door = doors[i];
                if(!door.canChange()) {
                    delete switchStates[color];
                    return false;
                }
            }

            const switches = switchLocations[color];
            for(let i = 0;i<switches.length;i++) {
                const [x,y] = switches[i];
                let tile = world.getForegroundTile(x,y);
                tile = switchForegrounds[tile];
                world.setForegroundTile(x,y,tile);
            }

            const syncHandler = ({error,door}) => {
                if(error) throw Error(INCONSPICUOUS_ERROR_MESSAGE);
                door.syncHandler = null;
                switchStates[color]--;
                if(switchStates[color] === 0) {
                    delete switchStates[color];
                }
            };

            for(let i = 0;i<doors.length;i++) {
                const door = doors[i];
                door.syncHandler = syncHandler;
                door.toggle();
            }

            return true;
        } else {
            return false;
        }
    };
}

function GetSwitchDoors(world,doors,switches) {
    return new SwitchDoors(world,doors,switches);
}
export default GetSwitchDoors;
