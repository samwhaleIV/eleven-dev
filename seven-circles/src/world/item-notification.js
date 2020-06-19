import Constants from "../constants.js";

const TIMEOUT = 1000;
const LABEL_OFFSET = -10.25 / 16;

const SCALE = Constants.WorldCanvasScale;

const LETTER_SPACING = SCALE < 1 ? 1 * SCALE : (1 / 3) * SCALE;
const WORD_SPACING = SCALE < 1 ? 2 * SCALE : 1;
const TEXT_SCALE = SCALE < 1 ? SCALE < 0.5 ? 1 : 2 : 3 * SCALE;

function ItemNotification(world,itemName,amount) {

    const hasNotification = Boolean(world.notificationState);

    if(hasNotification) {
        const {callback,timeout} = world.notificationState;
        clearTimeout(timeout);
        if(callback) callback(true);

        Object.assign(world.notificationState,{
            timeout: null, callback: null
        });

        if(world.notificationState.item === itemName) {
            world.notificationState.count += amount;
        } else {
            world.notificationState.count = amount;
        }
    } else {
        world.notificationState = {
            item: itemName,
            count: amount,
            timeout: null,
            callback: null
        };
    }

    const textSprite = world.addTextSprite({
        text: `+${world.notificationState.count} ${itemName}`,
        letterSpacing: LETTER_SPACING,
        wordSpacing: WORD_SPACING,
        scale: TEXT_SCALE,
        color: "white",
        target: world.player,
        y: LABEL_OFFSET
    });

    const callback = noDeletion => {
        world.highSpriteLayer.remove(textSprite.ID);
        if(!noDeletion) delete world.notificationState;
    };

    Object.assign(world.notificationState,{
        timeout: setTimeout(callback,TIMEOUT), callback
    });

}
export default ItemNotification;
