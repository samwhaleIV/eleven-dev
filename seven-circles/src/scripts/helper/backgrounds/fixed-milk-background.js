import AddPositionBackground from "./position-background.js";

function AddFixedMilkBackground(world,x,y,width,height,topLayer) {
    const waterBackground = new Eleven.WaterBackground(
        world.grid,world.tileset,240,224,10000
    );
    waterBackground.useCameraOffset = false;
    waterBackground.blendMode = "multiply";
    world.dispatchRenderer.addResize(waterBackground.resize);
    AddPositionBackground(
        world,waterBackground,x,y,width,height,topLayer
    );
}
export default AddFixedMilkBackground;
