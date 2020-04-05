import ZIndexBook from "./z-indices.js";

const {TextLayer, SpeechBox} = Eleven;

const TEXT_BOX_WIDTH = 800;
const TEXT_BOX_HEIGHT = 300;
const BOTTOM_MARGIN = 5;
const TEXT_SCALE = 4;

function WorldMessage(dispatchRenderer,text,instant) {
    this.complete = false;
    this.terminated = false;

    const textLayer = new TextLayer({
        text: text,
        rowSpacing: 0.5,
        boxPadding: 4,
        scale: TEXT_SCALE,
        textSpacing: 0.5,
        width: TEXT_BOX_WIDTH,
        height: TEXT_BOX_HEIGHT
    });
    const ID = dispatchRenderer.addFinalize((context,{halfWidth,height})=>{
        const x = Math.floor(halfWidth - textLayer.width / 2);
        const y = height - textLayer.height - BOTTOM_MARGIN;
        context.fillStyle = "white";
        context.fillRect(x,y,textLayer.width,textLayer.height);
        textLayer.render(context,x,y);
    },ZIndexBook.WorldMessage);

    const speechBox = new SpeechBox(textLayer);

    const complete = () => {
        speechBox.finish();
        this.complete = true;
    };

    if(!instant) {
        (async ()=>{
            await speechBox.start();
            this.complete = true;
        })();
    } else {
        complete();
    }

    this.advance = complete;

    this.terminate = () => {
        dispatchRenderer.removeFinalize(ID);
        this.terminated = true;
    };
}
export default WorldMessage;
