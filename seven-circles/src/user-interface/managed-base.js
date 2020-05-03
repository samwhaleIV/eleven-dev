function ManagedBase(proxyFrame,terminate,keyDown,keyUp) {
    const {InputServer} = SVCC.Runtime;
    const {keyBind} = InputServer;

    const managedGamepad = InputServer.managedGamepad;
    managedGamepad.save();

    const uiExit = () => {
        const terminationResult = terminate();
        if(terminationResult === "block") return;
        managedGamepad.restore();
    };

    const keyDownMask = data => {
        if(data.repeat) return;
        if(keyDown && keyDown(data) === "exit") uiExit();
    };
    const keyUpMask = data => {
        if(keyUp) keyUp(data);
    };

    proxyFrame.keyDown = keyBind.impulse(keyDownMask);
    proxyFrame.keyUp = keyBind.impulse(keyUpMask);

    proxyFrame.inputGamepad = managedGamepad.poll;

    managedGamepad.keyDown = keyDownMask;
    managedGamepad.keyUp = keyUpMask;

    return uiExit;
}

export default ManagedBase;
