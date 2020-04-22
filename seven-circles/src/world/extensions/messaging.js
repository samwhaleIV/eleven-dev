import WorldMessage from "../world-message.js";
import WorldPrompt from "../world-prompt.js";

async function prompt(question,options) {
    let shouldUnlockPlayer = false;
    if(this.playerController && !this.playerController.locked) {
        shouldUnlockPlayer = true;
    }
    if(shouldUnlockPlayer) {
        this.playerController.locked = true;
    }
    const optionIndex = await new Promise(resolve => {
        this.directionalMessage = new WorldPrompt(
            this.dispatchRenderer,question,options,resolve
        );
    });
    this.directionalMessage = null;
    if(shouldUnlockPlayer) {
        this.playerController.locked = false;
    }
    return optionIndex;
}

function showMessage(message,instant,lock) {
    const canLock = !this.messageLock && this.playerController && lock;
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

async function sayNamed(message,name,colorCode) {
    const lines = message.split(" ");
    lines.unshift(`&%${colorCode}${name}:`);
    lines[1] = `%b` + lines[1];
    return showMessage.call(this,lines,false,true);
}
async function say(message) {
    return showMessage.call(this,message,false,true);
}
function sayUnlocked(message) {
    return showMessage.call(this,message,false,false);
}
function message(message) {
    return showMessage.call(this,message,true,true);
}
function messageUnlocked(message) {
    return showMessage.call(this,message,true,false);
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
                if(this.messageLock && this.playerController) {
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
    sayUnlocked,
    advanceMessage,
    canAdvanceMessage,
    message,
    messageUnlocked,
    clearMessages
};
