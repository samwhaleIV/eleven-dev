const DELAY = 150;

async function MessageChain(world,messages,lock) {
    if(lock) {
        world.playerController.lock();
    }
    for(let i = 0;i<messages.length;i++) {
        await world.sayUnlocked(messages[i]);
        await delay(DELAY);
    }
    if(lock) {
        world.playerController.unlock();
    }
}

export default MessageChain;
