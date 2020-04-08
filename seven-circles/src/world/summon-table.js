import {ItemLookup} from "../user-interface/items.js";

const getItemName = safeID => {
    return ItemLookup[safeID].name;
};

const SummonTable = Object.freeze({
    "rock": {
        tileID: 28
    },
    "elf-rock": {
        tileID: 27,
    },
    "sink": {
        tileID: 29,

    },
    "present": {
        tileID: 30,
        spriteData: () => {
            const gifts = [
                "sink","rock","elf-rock"
            ];
            const gift = gifts[Math.floor(gifts.length*Math.random())];
            return {
                impulse: ({world,self}) => {
                    world.playerController.lock();
                    (async () => {
                        const displayName = getItemName(gift);
                        world.spriteLayer.remove(self.ID);
                        world.showMessageInstant(`Merry Christmas! You got one ${displayName}.`);
                        SVCC.Runtime.Inventory.addItem(gift);
                        world.playerController.unlock();
                    })();
                }
            }
        }
    }
});

export default SummonTable;
