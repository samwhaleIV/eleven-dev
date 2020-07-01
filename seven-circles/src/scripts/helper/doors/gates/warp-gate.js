import GetInteractionStart from "../../self/get-interaction-start.js";
const INTERACTION_START = GetInteractionStart();

const HOLDER_TOP = 1103;
const HOLDER_BOTTOM = 1167;

const GATE_OPEN_ID = 1036;
const GATE_WIDTH = 2;
const GATE_HEIGHT = 3;

function WarpGate(world,gateX,gateY,crystalHolders,saveStateBase,gateUsed) {
    const {saveState,inventory} = world;
    const keyFilter = key => `${saveStateBase}-warp-crystal-holder-${key}`;

    const hasCrystal = key => Boolean(saveState.get(keyFilter(key)));
    const registerCrystal = key => saveState.set(keyFilter(key),true);

    let gateOpen = false;
    const gateIsOpen = () => {
        if(gateOpen) return true;
        const holderCount = crystalHolders.length;
        let crystalCount = 0;
        for(let i = 0;i<holderCount;i++) {
            if(crystalHolders[i].hasCrystal) crystalCount++;
        }
        gateOpen = crystalCount === holderCount;
        return gateOpen;
    };

    const insertCrystal = ID => {
        registerCrystal(ID);
        const {x,y} = crystalHolders[ID];

        world.setSuperForegroundTile(x,y-1,HOLDER_TOP);
        world.setForegroundTile(x,y,HOLDER_BOTTOM);

        crystalHolders[ID].hasCrystal = true;
    };

    const openGate = () => world.stampForeground(
        gateX,gateY,GATE_OPEN_ID,GATE_WIDTH,GATE_HEIGHT
    );

    const tryOpenGate = () => {
        const shouldOpen = !gateOpen && gateIsOpen();
        if(shouldOpen) openGate();
        return shouldOpen;
    };

    const gateInteraction = INTERACTION_START;

    const interactions = {[gateInteraction]:true};

    const gateBottom = gateY + GATE_HEIGHT - 1;
    for(let x = 0;x<GATE_WIDTH;x++) {
        world.setInteractionTile(gateX+x,gateBottom,gateInteraction);
    }

    for(let i = 0;i<crystalHolders.length;i++) {
        const [x,y] = crystalHolders[i];
        const interactionValue = gateInteraction + i + 1;
        world.setInteractionTile(x,y,interactionValue);
        interactions[interactionValue] = i;

        crystalHolders[i] = {x,y,hasCrystal:false};
        if(hasCrystal(i)) insertCrystal(i);
    }

    if(gateIsOpen()) openGate();

    const gateInteract = () => {
        if(gateIsOpen()) {
            if(!gateUsed) {
                world.message("The gate won't do anything.");
                return;
            }
            gateUsed();
            world.prompt("Do you want to use the warp gate?");
        } else {
            world.message("All the crystals must be placed in the crystal holders!");
        }
    };

    const holderInteract = ID => {
        const {hasCrystal} = crystalHolders[ID];
        if(hasCrystal) {
            world.message("The %sWarp Crystal %bis secure.");
            return;
        }
        if(!inventory.has("warp-crystal")) {
            world.message("This holder needs a %sWarp Crystal %bto power the gate.");
            return;
        }
        inventory.take("warp-crystal",1);
        insertCrystal(ID);

        if(tryOpenGate()) {
            world.message("The warp gate has is now powered!");
        } else {
            world.message("This crystal holder is now active!");
        }
    };

    this.tryInteract = ({value}) => {
        if(!(value in interactions)) return false;

        if(value === gateInteraction) {
            gateInteract();
        } else {
            holderInteract(interactions[value]);
        }

        return true;
    };
}
export default WarpGate;
