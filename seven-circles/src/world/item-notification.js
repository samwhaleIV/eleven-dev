const TIMEOUT = 1000;
const LABEL_OFFSET = -10.25 / 16;

const LETTER_SPACING = 0;
const WORD_SPACING = 2;
const TEXT_SCALE = 3;

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
