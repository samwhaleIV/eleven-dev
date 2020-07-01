import MessageHelper from "./message-helper.js";

const {SpeechBox,ResourceManager,AudioManager} = Eleven;

function WorldMessage(dispatchRenderer,text,instant) {
    this.complete = false;
    this.terminated = false;

    this.textLayer = MessageHelper.GetTextLayer(text);
    const terminateMessage = MessageHelper.AddRenderer(dispatchRenderer,this);

    const textSound = ResourceManager.getAudio("text-sound");
    const playSound = () => AudioManager.playSound(textSound);

    const speechBox = new SpeechBox(this.textLayer,playSound);

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
