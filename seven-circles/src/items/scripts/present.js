import {ItemLookup} from "../items.js";

const DEFAULT_TILE_ID = 30;

const gifts = ["sink","rock","elf-rock"];

const getItemName = safeID => {
    return ItemLookup[safeID].name;
};

const getGiftMessage = item => {
    const displayName = getItemName(item);
    return `Merry Christmas! You got one ${displayName}.`;
};

const giveGift = ({world,self,inventory}) => {
    const {gift} = self;
    world.playerController.lock();
    (async () => {
        await world.showMessageInstant(getGiftMessage(gift));

        world.spriteLayer.remove(self.ID);
        inventory.addItem(gift);

        world.playerController.unlock();
    })();
};

const spriteData = {
    impulse: giveGift, retain: false
};

const getRandomPresent = () => {
    return gifts[Math.floor(gifts.length*Math.random())];
};

const getSpriteData = () => {
    return {
        impulse: giveGift,
        gift: getRandomPresent()
    };
};

function Present(tileID=DEFAULT_TILE_ID) {
    this.tileID = tileID;
    this.spriteData = getSpriteData;
}
export default Present;
