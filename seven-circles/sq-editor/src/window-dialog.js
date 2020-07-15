import FileSystem from "./file-system.js";
const remote = require("electron").remote;

const WindowDialog = new (function() {
    const {dialog} = remote;
    const getWindow = () => remote.getCurrentWindow();

    const containerFilters = [{name: "SQ Container", extensions: ["json"]}];

    this.selectFile = async () => {
        const result = await dialog.showOpenDialog(getWindow(),{
            title: "Open Container",
            buttonLabel: "Open",
            defaultPath: FileSystem.containerFolder,
            filters: containerFilters,
            properties: ["openFile","dontAddToRecent"]
        });
        return Object.assign(result,{filePath:result.filePaths[0]});
    };

    this.selectMapImage = async () => {
        const result = await dialog.showOpenDialog(getWindow(),{
            title: "Select Map",
            buttonLabel: "Select",
            defaultPath: FileSystem.mapImageFolder,
            filters: [{name: "PNG Image", extensions: ["png"]}],
            properties: ["openFile","dontAddToRecent"]
        });
        return Object.assign(result,{filePath:result.filePaths[0]});
    };

    this.saveAs = async () => {
        const result = await dialog.showSaveDialog(getWindow(),{
            title: "Save Container",
            defaultPath: FileSystem.containerFolder,
            buttonLabel: "Save",
            filters: containerFilters,
            properties: ["dontAddToRecent"]
        });
        return result;
    };

    this.alert = async text => {
        return dialog.showMessageBox(getWindow(),{
            title: "Sequence",
            type: "info",
            message: text,
            defaultId: 0,
            cancelId: 0,
            normalizeAccessKeys: false,
            noLink: false,
            buttons: ["Okay"]
        });
    };

    this.prompt = async text => {
        const result = await dialog.showMessageBox(getWindow(),{
            title: "Sequence",
            type: "question",
            message: text,
            defaultId: 0,
            cancelId: 1,
            normalizeAccessKeys: false,
            noLink: false,
            buttons: ["Yes","No"]
        });
        return result.response === 0;
    };
})();
globalThis.WindowDialog = WindowDialog;

export default WindowDialog;
