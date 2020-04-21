import MessageHelper from "./message-helper.js";

const {SpeechBox} = Eleven;

function WorldMessage(dispatchRenderer,text,instant) {
    this.complete = false;
    this.terminated = false;

    this.textLayer = MessageHelper.GetTextLayer(text);
    const terminateMessage = MessageHelper.AddRenderer(dispatchRenderer,this);

    const speechBox = new SpeechBox(this.textLayer);

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
        terminateMessage(); this.terminated = true;
    };
}
export default WorldMessage;
