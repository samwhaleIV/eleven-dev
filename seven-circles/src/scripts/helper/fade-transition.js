const DEFAULT_FADE_TIME = 750;

async function FadeTransition(world,script,data,fadeTime) {
    if(!data) data = new Object();
    if(isNaN(fadeTime)) {
        fadeTime = DEFAULT_FADE_TIME;
    }
    data.fromFade = true;

    if(world.playerController) world.playerController.lock();

    await world.fadeToBlack(fadeTime).then(world.popFader);
    await world.setLevel(script,data,false);
    await world.fadeFromBlack(fadeTime).then(world.popFader);

    world.startScript();
}
export default FadeTransition;
