import GetInteractionStart from "./get-interaction-start.js";
import StaticPickup from "./static-pickup.js";

const INTERACTION_ID_START = GetInteractionStart();

function PickupField(world,inventory,items) {
    const itemLookup = {};
    let idStart = INTERACTION_ID_START;
    for(let i = 0;i<items.length;i++) {
        const [x,y,item,amount,isSuperForeground,clearCollision] = items[i];

        const ID = idStart; idStart++;

        const staticPickup = new StaticPickup(
            world,inventory,x,y,item,amount,
            isSuperForeground,clearCollision
        );

        itemLookup[ID] = staticPickup;

        world.setInteractionTile(x,y,ID);
    }

    this.tryPickup = ({value}) => {
        if(value in itemLookup) {
            return itemLookup[value].grab();
        }
        return false;
    };
}
export default PickupField;
