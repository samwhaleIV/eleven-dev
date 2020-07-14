import WorldEditor from "./world-editor.js";

const {CanvasManager} = Eleven;

const loadEditor = async () => {
    await CanvasManager.setFrame(WorldEditor);
    CanvasManager.start();
    globalThis.world = CanvasManager.frame;
};
loadEditor();
