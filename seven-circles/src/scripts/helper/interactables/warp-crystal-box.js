import GetInteractionStart from "../self/get-interaction-start.js";
const INTERACTION_START = GetInteractionStart();

const POWERED_HOLDER = 1229;

const BOX_WIDTH = 2, BOX_HEIGHT = 1;

const BoxStates = {
    Closed: 0,
    Open: 1,
    Empty: 2
};

const BoxDisplay = {
    [BoxStates.Closed]: 1422,
    [BoxStates.Empty]: 1230,
    [BoxStates.Open]: 1294
};

function WarpCrystalBox(world,x,y,powerCellHolders,saveStateBase) {
    const {saveState,inventory} = world;

    const boxKey = `${saveStateBase}-warp-crystal-box`;
    const holderKeyBase = `${saveStateBase}-power-cell-holder-`;

    const getBoxState = () => {
        const state = saveState.get(boxKey);
        if(state === null) return BoxStates.Closed;
        return state;
    };

    let boxState = null;

    const setBoxState = state => {
        if(state !== boxState) {
            boxState = state;
            saveState.set(boxKey,boxState);
        }
        if(boxState in BoxDisplay) {
            world.stampForeground(
                x,y,BoxDisplay[boxState],BOX_WIDTH,BOX_HEIGHT
            );
        }
    };

    const holderKey = ID => holderKeyBase + ID;
    const holderHasCell = ID => saveState.get(holderKey(ID));

    const insertCell = ID => {
        saveState.set(holderKey(ID),true);

        const holder = powerCellHolders[ID];
        const {x,y} = holder; holder.hasCell = true;
    
        world.setForegroundTile(x,y,POWERED_HOLDER);
    };

    const boxInteraction = INTERACTION_START + 1;
    const interactions = {[boxInteraction]:true};

    for(let i = 0;i<powerCellHolders.length;i++) {
        const [x,y] = powerCellHolders[i];

        powerCellHolders[i] = {x,y,hasCell:false};

        const interactionID = boxInteraction+i+1;
        interactions[interactionID] = i;

        world.setInteractionTile(x,y,interactionID);
        if(holderHasCell(i)) insertCell(i);
    }

    for(let xOffset = 0;xOffset<BOX_WIDTH;xOffset++) {
        for(let yOffset = 0;yOffset<BOX_HEIGHT;yOffset++) {
            world.setInteractionTile(x+xOffset,y+yOffset,boxInteraction);
        }
    }

    const boxInteract = () => {
        switch(boxState) {
            case BoxStates.Closed:
                world.message("All the power cell holders must be powered to open the box!");
                break;
            case BoxStates.Open:
                setBoxState(BoxStates.Empty);
                inventory.give("warp-crystal");
                world.message("The warp crystal is now yours!");
                break;
            case BoxStates.Empty:
                world.message("You already got the warp crystal from this box.");
                break;
        }
    };

    const tryOpenBox = () => {
        let poweredCount = 0;
        const holderCount = powerCellHolders.length
        for(let i = 0;i<holderCount;i++) {
            if(powerCellHolders[i].hasCell) poweredCount++;
        }
        if(poweredCount === holderCount) {
            setBoxState(BoxStates.Open);
        }
    };

    const holderInteract = ID => {
        if(powerCellHolders[ID].hasCell) {
            world.message("The device is powering the crystal box.");
            return;
        }
        if(!inventory.has("power-cell")) {
            world.message("You need a power cell to activate this device!");
            return;
        }
        insertCell(ID);
        tryOpenBox();
        inventory.take("power-cell",1);
        world.message("Power cell inserted!");
    };

    this.tryInteract = ({value}) => {
        if(!(value in interactions)) return false;
        if(value === boxInteraction) {
            boxInteract();
        } else {
            holderInteract(interactions[value]);
        }
        return true;
    };

    setBoxState(getBoxState());
}
export default WarpCrystalBox;
