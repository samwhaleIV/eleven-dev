const {TextLayer, SpeechBox} = Eleven;

const TEXT_BOX_WIDTH = 790;
const TEXT_BOX_HEIGHT = 400;
const BOTTOM_MARGIN = 10;

const MESSAGE_Z_INDEX = 1000;

function WorldMessage(dispatchRenderer,text,instant) {
    this.complete = false;
    this.terminated = false;

    const textLayer = new TextLayer({
        text: text,
        rowSpacing: 1,
        boxPadding: 4,
        scale: 4,
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
    },MESSAGE_Z_INDEX);

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
