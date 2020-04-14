const DEFAULT_FADE_TIME = 750;

const tryUnlock = world => {
    if(world.playerController) {
        world.playerController.unlock();
    }
};
const tryLock = world => {
    if(world.playerController) {
        world.playerController.lock();
    }
};
const tryScriptStart = world => {
    const {script} = world;
    if(script.start) script.start();
};

async function FadeTransition(world,script,data,fadeTime) {
    if(!data) data = new Object();
    if(isNaN(fadeTime)) {
        fadeTime = DEFAULT_FADE_TIME;
    }
    data.fromFade = true;

    tryLock(world);

    await world.fadeToBlack(fadeTime).then(world.popFader);
    await world.runScript(script,data,false);
    await world.fadeFromBlack(fadeTime).then(world.popFader);

    tryScriptStart(world);
    tryUnlock(world);
}
export default FadeTransition;
