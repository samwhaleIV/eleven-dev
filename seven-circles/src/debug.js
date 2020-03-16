const {CanvasManager, AudioManager, ResourceManager} = Eleven;

function Debug() {
    this.PanZoomWorld = () => {
        const frame = CanvasManager.frame;
        const panZoom = frame.grid.getPanZoom();
        frame.spriteFollower.disable();
        panZoom.bindToFrame(frame);
    };
}
export default Debug;
