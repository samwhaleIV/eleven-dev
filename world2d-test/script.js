function World() {
    const world = new Eleven.World2D();
    const camera = world.camera.center();
    const panZoom = world.getPanZoom();

    this.world = world;
    this.camera = camera;

    this.resize = world.resize;
    this.render = world.render;

    this.clickDown = panZoom.panStart;
    this.clickUp = panZoom.panEnd;
    this.pointerMove = panZoom.pan;
    this.pointerScroll = panZoom.zoom;
}

Eleven.CanvasManager.start({
    frame: World,
    markLoaded: true
});
