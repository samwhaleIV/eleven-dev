const TIMEOUT = 500;

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
        color: "white",
        target: world.player,
        y: -3 / 5
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
