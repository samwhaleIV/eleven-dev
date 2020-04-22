import ZIndexBook from "../../world/z-indices.js";
import Constants from "../../constants.js";

const TOP_DISTANCE = Constants.WorldUIScreenMargin;
const TEXT_SCALE = 4;
const TEXT_COLOR = "white";
const TEXT_BACKGROUND = "black";
const TEXT_PADDING = 2;

const TRANSITION_TIME = 500;
const CENTER_TRANSITION_TIME = 1000;
const OFFSCREEN_DISTANCE_FACTOR = 12;
const CENTERED_DISTANCE_FACTOR = 2;

const {TextSprite} = Eleven;

const labelBase = {
    color: TEXT_COLOR,
    backgroundColor: TEXT_BACKGROUND,
    backgroundPadding: TEXT_PADDING,
    scale: TEXT_SCALE,
    absolutePositioning: true
};

const getLabel = (world,lines,centered,getYOffset) => {
    labelBase.lines = lines;
    const label = new TextSprite(labelBase);
    const ID = world.dispatchRenderer.addFinalize((context,size,time)=>{
        const yOffset = getYOffset(time) * size.height;
        if(centered) {
            label.render(context,Math.floor(size.halfWidth),Math.floor(size.halfHeight) + yOffset);
        } else {
            label.render(context,size.halfWidth,label.halfHeight + TOP_DISTANCE + yOffset);
        }
    },ZIndexBook.ObjectiveLabel);
    return ID;
};

function ObjectiveText(world) {
    let activeID = null;
    let showingCentered = false;

    let showStart = null;
    let closeStart = null;

    let closeCallback = null;

    const sendCloseCallback = async () => {
        if(closeCallback) closeCallback();
    };

    const getDistanceFactor = () => {
        return showingCentered ? CENTERED_DISTANCE_FACTOR : OFFSCREEN_DISTANCE_FACTOR;
    };

    const getTransitionTime = () => {
        return showingCentered ? CENTER_TRANSITION_TIME : TRANSITION_TIME;
    };

    const getYOffset = time => {
        if(showStart !== null) {
            let t = (time.now - showStart) / getTransitionTime();
            if(t < 0) {
                t = 0;
            } else if(t > 1) {
                showStart = null;
                return 0;
            }
            const factor = getDistanceFactor();
            return -(1-t) / factor;
        } else if(closeStart !== null) {
            let t = (time.now - closeStart) / getTransitionTime();
            const factor = getDistanceFactor();
            if(t < 0) {
                t = 0;
            } else if(t > 1) {
                sendCloseCallback();
                return -1 / factor;
            }
            return -t / factor;
        }
        return 0;
    };

    this.show = (lines,centered,instant) => {
        if(closeStart !== null) return;
        if(activeID !== null) {
            world.dispatchRenderer.removeFinalize(activeID);
            activeID = null;
        } else {
            showingCentered = Boolean(centered);
            if(instant) {
                showStart = null;
            } else {
                showStart = performance.now();
            }
        }
        activeID = getLabel(world,lines,showingCentered,getYOffset);
    };
    this.close = async () => {
        await new Promise(resolve => {
            closeStart = performance.now();
            closeCallback = resolve;
        });
        world.dispatchRenderer.removeFinalize(activeID);
        closeStart = null;
        activeID = null;
        this.status = null;
    };

    Object.defineProperties(this,{
        text: {
            set: value => {
                if(!Array.isArray(value)) {
                    value = [value];
                }
                this.show(value,false);
            },
            enumerable: true
        },
    });

    this.status = null;

    this.set = (text,status) => {
        this.text = text;
        this.status = status;
    };

    Object.seal(this);
}
export default ObjectiveText;
