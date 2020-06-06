function getInputs() {
    const {keyDown,keyUp,input} = this;
    const gamepad = this.managedGamepad;
    return [input,keyDown,keyUp,gamepad.inputGamepad,gamepad.keyDown,gamepad.keyUp];
}
function setInputs([
    input,keyDown,keyUp,inputGamepad,keyDownGamepad,keyUpGamepad
]) {
    //This doesn't handle this.inputGamepad because it is exclusively handled by the managedGamepad
    this.input = input;
    this.keyDown = keyDown;
    this.keyUp = keyUp;
    this.managedGamepad.inputGamepad = inputGamepad;

    this.managedGamepad.keyDown = keyDownGamepad || keyDown;
    this.managedGamepad.keyUp = keyUpGamepad || keyUp;
}
function clearInputs() {
    setInputs.call(this,[null,null,null,null,null,null]);
}

export default {getInputs,clearInputs,setInputs};
