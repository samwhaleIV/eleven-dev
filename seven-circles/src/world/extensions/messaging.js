import WorldMessage from "../world-message.js";
import WorldPrompt from "../world-prompt.js";

async function prompt(question,options) {
    const shouldUnlockPlayer = this.playerController && !this.playerController.locked;

    if(shouldUnlockPlayer) this.playerController.lock();

    const optionIndex = await new Promise(resolve => {
        this.directionalMessage = new WorldPrompt(
            this.dispatchRenderer,question,options,resolve
        );
    });
    this.directionalMessage = null;

    if(shouldUnlockPlayer) this.playerController.unlock();

    return optionIndex;
}

function showMessage(message,instant) {
    const canLock = this.playerController && !this.playerController.locked;
    if(canLock) {
        this.messageLock = true;
        this.playerController.lock();
    }
    if(this.canAdvanceMessage()) {
        this.textMessageStack.push([message,instant]);
    } else {
        this.textMessage = new WorldMessage(this.dispatchRenderer,message,instant);
    }
    return new Promise(resolve => {
        this.messageResolveStack.push(resolve);
    });
}

function sayNamed(message,name,colorCode) {
    const lines = message.split(" ");
    lines.unshift(`&%${colorCode}${name}:`);
    lines[1] = `%b` + lines[1];
    return showMessage.call(this,lines,false);
}
function say(message) {
    return showMessage.call(this,message,false);
}
function message(message) {
    return showMessage.call(this,message,true);
}
function canAdvanceMessage() {
    return Boolean(this.textMessage);
}

function advanceMessage() {
    if(this.canAdvanceMessage()) {
        if(this.textMessage.complete) {
            this.textMessage.terminate();
            this.textMessage = null;
            if(this.textMessageStack.length >= 1) {
                const newMessage = this.textMessageStack.shift();
                showMessage.apply(this,newMessage);
            } else {
                clearMessageResolveStack(this);
                if(this.playerController && this.messageLock) {
                    this.playerController.unlock();
                }
                this.messageLock = false;
            }
        } else {
            this.textMessage.advance();
        }
    }
}

function clearMessageResolveStack(world) {
    const stack = world.messageResolveStack;
    while(stack.length) {
        const resolver = stack.pop();
        resolver();
    }
}

function clearMessages() {
    this.messageLock = false;
    this.textMessage = null;
    this.textMessageStack.splice(0);
    this.directionalMessage = null;
    clearMessageResolveStack(this);
}

export default {
    prompt,
    sayNamed,
    say,
    advanceMessage,
    canAdvanceMessage,
    message,
    clearMessages
};
