const {Fader,Faders} = Eleven;

const FADER_DURATION = 5000;

function addFader(renderer) {
    return this.faderList.add(new Fader(renderer));
}
function blackFader() {
    return this.addFader(Faders.Black);
}
function whiteFader() {
    return this.addFader(Faders.White);
}
function removeFader(fader) {
    const ID = typeof fader === "number" ? fader : fader.ID;
    this.faderList.remove(ID);
}
function fade(renderer,duration,fadeTo) {
    if(isNaN(duration)) duration = FADER_DURATION;
    return new Promise(resolve => {
        const fader = this.addFader(renderer);
        const didStart = fader.start({
            polarity: Boolean(fadeTo),
            duration, callback: resolve
        });
        if(!didStart) resolve();
    });
}
function fadeFrom(renderer,duration) {
    return this.fade(renderer,duration,false);
}
function fadeTo(renderer,duration) {
    return this.fade(renderer,duration,true);
}
function fadeToBlack(duration) {
    return this.fadeTo(Faders.Black,duration);
}
function fadeToWhite(duration) {
    return this.fadeTo(Faders.White,duration);
}
function fadeFromBlack(duration) {
    return this.fadeFrom(Faders.Black,duration);
}
function fadeFromWhite(duration) {
    return this.fadeFrom(Faders.White,duration);
}

export default {
    fade, addFader,blackFader,whiteFader,removeFader,
    fadeFrom,fadeTo,fadeToBlack,
    fadeToWhite,fadeFromBlack,fadeFromWhite
};
