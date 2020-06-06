import StarField from "../helper/star-field.js";

const TITLE_TEXT = "";
const TITLE_FONT = "22px sans-serif";

const TITLE_FADE_IN_DURATION = 2000;
const TITLE_FADE_OUT_DURATION = 1000;
const TEXT_TIME = 3000;
const TEXT_DELAY = 3000;

const FADE_IN_TIME = 4000;

const FADE_OUT_TIME = 3000;

const TEXT_LINES = [
    "What one may see another may not.",
    "A saint, a devil. A martyr, a traitor.",
    "Are you so sure of stars?",
    "What must stars think of you?",
];

const TARGET_SCRIPT = "TunnelsOfHell";

function Title() {
    this.text = TITLE_TEXT;

    let fadeInStart = null;
    let fadeOutStart = null;

    let fadeInResolve, fadeOutResolve;

    const canFade = () => {
        return fadeInStart === null && fadeOutStart === null;
    };

    this.fadeIn = () => {
        if(!canFade()) return;
        return new Promise(resolve => {
            fadeInStart = performance.now();
            fadeInResolve = resolve;
        });
    };

    this.fadeOut = () => {
        if(!canFade()) return;
        return new Promise(resolve => {
            fadeOutStart = performance.now();
            fadeOutResolve = resolve;
        });
    };

    this.render = (context,{halfWidth,halfHeight},{now}) => {
        context.translate(halfWidth,halfHeight);

        let t = 1;

        const isStartFade = fadeInStart !== null;
        if(isStartFade || fadeOutStart !== null) {
            const fadeDuration = isStartFade ? TITLE_FADE_IN_DURATION : TITLE_FADE_OUT_DURATION
            t = (now - fadeInStart) / fadeDuration;
            if(t < 0) t = 0; else if(t > 1) {
                t = 1;
                if(isStartFade) {
                    fadeInStart = null;
                    fadeInResolve();
                } else {
                    fadeOutStart = null;
                    fadeOutResolve();
                }
            }
            if(!fadeInStart) t = 1 - t;
        }

        context.fillStyle = `rgba(255,255,255,${t})`;

        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = TITLE_FONT;
        context.fillText(this.text,0,0);

        context.translate(-halfWidth,-halfHeight);
    }
}

function HelloWorld({world,transition}) {
    world.setMap("empty");
    const {dispatchRenderer} = world;

    const title = new Title();
    const starField = new StarField();

    dispatchRenderer.addBackground(starField.render);
    dispatchRenderer.addBackground(title.render);

    this.load = () => {
        (async () => {
            await world.fadeFromBlack(FADE_IN_TIME);
            world.popFader();
            for(let i = 0;i<TEXT_LINES.length;i++) {
                title.text = TEXT_LINES[i];
                await title.fadeIn();
                await frameDelay(TEXT_TIME);
                await title.fadeOut();
                title.text = "";
                await frameDelay(TEXT_DELAY);
            }
            transition(TARGET_SCRIPT,null,FADE_OUT_TIME);
        })();
    };
}
export default HelloWorld;
