const DELAY = 150;

async function MessageChain(world,messages,lock) {
    if(lock) {
        world.playerController.lock();
    }
    for(let i = 0;i<messages.length;i++) {
        const message = messages[i];
        if(typeof message === "number") continue;

        await world.sayUnlocked(messages[i]);
        let duration = DELAY;

        const nextMessage = messages[i+1];
        if(typeof nextMessage === "number") {
            duration = nextMessage;
        }

        await delay(duration);
    }
    if(lock) {
        world.playerController.unlock();
    }
}

export default MessageChain;
