import AddPositionBackground from "./position-background.js";

function AddWaterBackground(world,x,y,width,height,topLayer) {
    const waterBackground = new Eleven.WaterBackground(
        world.grid,world.tileset,272,128,10000
    );
    waterBackground.useCameraOffset = false;
    world.dispatchRenderer.addResize(waterBackground.resize);
    AddPositionBackground(
        world,waterBackground,x,y,width,height,topLayer
    );
}
export default AddWaterBackground;
