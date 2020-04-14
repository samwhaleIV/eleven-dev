import StarField from "../helper/star-field.js";
import FadeTransition from "../helper/fade-transition.js";

const TITLE_TEXT = "";
const TITLE_FONT = "22px sans-serif";

const TITLE_FADE_IN_DURATION = 2000;
const TITLE_FADE_OUT_DURATION = 1000;
const TEXT_TIME = 3000;
const TEXT_DELAY = 3000;

const FADE_IN_TIME = 8000;

const FADE_OUT_TIME = 3000;

const TEXT_LINES = [
    "Stars. That's cool.",
    "What makes you so sure they're stars?",
    "That wasn't my point, okay? I'm just saying they're cool.",
    "Oh. Yeah. They're cool, I guess."
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

        if(fadeInStart !== null) {
            t = (now - fadeInStart) / TITLE_FADE_IN_DURATION;
            if(t < 0) t = 0; else if(t > 1) {
                t = 1; fadeInStart = null; fadeInResolve();
            }
        } else if(fadeOutStart !== null) {
            t = (now - fadeOutStart) / TITLE_FADE_OUT_DURATION;
            if(t < 0) t = 0; else if(t > 1) {
                t = 1; fadeOutStart = null; fadeOutResolve(); 
            }
            t = 1 - t;
        }

        context.fillStyle = `rgba(255,255,255,${t})`;

        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = TITLE_FONT;
        context.fillText(this.text,0,0);

        context.translate(-halfWidth,-halfHeight);
    }
}

function HelloWorld({world}) {
    world.setMap("empty");
    const {dispatchRenderer} = world;

    const title = new Title();
    const starField = new StarField();

    dispatchRenderer.addBackground(starField.render);
    dispatchRenderer.addBackground(title.render);

    this.load = () => {
        (async () => {
            if(DEV) {
                world.runScript(TARGET_SCRIPT,{devLoad:true},true); return;
            }
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
            FadeTransition(world,TARGET_SCRIPT,FADE_OUT_TIME);
        })();
    };
}
export default HelloWorld;
