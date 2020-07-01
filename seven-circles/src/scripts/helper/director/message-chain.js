const DELAY = 150;

async function MessageChain(world,messages,nameData) {
    const [name,color] = nameData || [];

    const {playerController} = world;

    const shouldHandleLock = playerController && !playerController.locked;
    if(shouldHandleLock) playerController.lock();

    const say = message => {
        return name ? world.sayNamed(message,name,color) : world.say(message);
    };

    for(let i = 0;i<messages.length;i++) {
        const message = messages[i];
        if(typeof message === "number") continue;

        await say(messages[i]);
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
