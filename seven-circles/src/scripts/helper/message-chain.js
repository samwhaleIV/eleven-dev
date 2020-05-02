const DELAY = 150;

async function MessageChain(world,messages) {

    const {playerController} = world;

    const shouldHandleLock = playerController && !playerController.locked;
    if(shouldHandleLock) playerController.lock();

    for(let i = 0;i<messages.length;i++) {
        const message = messages[i];
        if(typeof message === "number") continue;

        await world.say(messages[i]);
        let duration = DELAY;

        const nextMessage = messages[i+1];
        if(typeof nextMessage === "number") {
            duration = nextMessage;
        }

        await delay(duration);
    }
    
    if(shouldHandleLock) playerController.unlock();
}

export default MessageChain;
