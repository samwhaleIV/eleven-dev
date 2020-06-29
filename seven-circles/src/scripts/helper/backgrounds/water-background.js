import AddPositionBackground from "./position-background.js";

function GetWaterBackground(world) {
    const background = new Eleven.WaterBackground(
        world.grid,world.tileset,224,128,10000
    );
    world.dispatchRenderer.addResize(background.resize);
    return background;
}
function AddWaterBackground(world) {
    const background = GetWaterBackground(world);
    world.dispatchRenderer.addBackground(background.render);
}
function AddFixedWaterBackground(world,x,y,width,height,topLayer) {
    const background = GetWaterBackground(world);
    background.useCameraOffset = false;
    AddPositionBackground(
        world,background.render,x,y,width,height,topLayer
    );
}
export default AddWaterBackground;
export {AddWaterBackground,AddFixedWaterBackground};
