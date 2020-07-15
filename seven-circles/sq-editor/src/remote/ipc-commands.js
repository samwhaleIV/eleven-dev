const {ipcRenderer} = require("electron");

const IPCCommands = new (function(){
    const handlers = {};

    this.setHandler = (name,target) => {
        handlers[name] = target;
    };
    this.setHandlers = newHandlers => {
        Object.assign(handlers,newHandlers);
    };

    const sendHandler = command => {
        if(!(command in handlers)) return;
        handlers[command]();
    };

    const processEvent = (_,data) => sendHandler(data);
    this.sendCommand = sendHandler;

    ipcRenderer.on("toolbar-command",processEvent);
})();
globalThis.IPCCommands = IPCCommands;

export default IPCCommands;
