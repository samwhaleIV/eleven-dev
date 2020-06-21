import MessageHelper from "./message-helper.js";

const LINE_SPACING = 3;

function WorldPrompt(dispatchRenderer,question,options,callback) {

    const {AudioManager} = Eleven;

    const playCycleSound = () => AudioManager.playTone(150,0.3);
    const playAcceptSound = () => AudioManager.playTone(200,0.3);

    const optionCount = options.length;
    this.textLayer = null;

    let selection = 0;
    const cycleSelection = delta => {
        selection += delta;
        if(selection < 0) {
            selection = optionCount - 1;
        } else if(selection >= optionCount) {
            selection = 0;
        }
        playCycleSound();
    };

    const updateTextLayer = () => {
        const lines = [`%b${question}`,"\n"];
        for(let i = 0;i<optionCount;i++) {
            lines.push(`${i===selection?"%w%b|>":"%b| "}${options[i]}`,"\n");
        }
        lines.pop();

        this.textLayer = MessageHelper.GetTextLayer({
            text: lines, lineSpacing: LINE_SPACING
        });
        this.textLayer.finish();
    };

    const updateSelection = delta => {
        cycleSelection(delta); updateTextLayer();
    };

    const terminateMessage = MessageHelper.AddRenderer(dispatchRenderer,this);

    const terminate = () => {
        terminateMessage();
        playAcceptSound();
        callback(selection);
    };

    const moveUp = updateSelection.bind(this,-1);
    const moveDown = updateSelection.bind(this,1);

    this.move = ({impulse,repeat}) => {
        if(repeat) return;
        switch(impulse) {
            case "MoveLeft": case "MoveUp": moveUp(); break;
            case "MoveRight": case "MoveDown": moveDown(); break;
        }
    };
    this.accept = terminate;

    Object.seal(this);

    updateTextLayer();
}
export default WorldPrompt;
