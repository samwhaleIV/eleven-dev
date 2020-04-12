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
const tryPostFadeStart = world => {
    if(world.script.postIntroStart) {
        world.script.postIntroStart();
    }
};

async function FadeTransition(world,script,fadeTime,...parameters) {
    if(isNaN(fadeTime)) {
        fadeTime = DEFAULT_FADE_TIME;
    }
    tryLock(world);

    await world.fadeToBlack(fadeTime);
    world.runScript(script,...parameters);

    tryLock(world);

    world.popFader();
    await world.fadeFromBlack(fadeTime);
    world.popFader();

    tryUnlock(world);

    tryPostFadeStart(world);
}
export default FadeTransition;
