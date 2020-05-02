import AddPositionBackground from "./position-background.js";

function GetWaterBackground(world) {
    const background = new Eleven.WaterBackground(
        world.grid,world.tileset,224,128,10000
    );
    world.dispatchRenderer.addResize(background.resize);
    return background;
}
function addWaterBackground(world) {
    const background = GetWaterBackground(world);
    world.dispatchRenderer.addBackground(background.render);
}
function addFixedWaterBackground(world,x,y,width,height,topLayer) {
    const background = GetWaterBackground(world);
    background.useCameraOffset = false;
    AddPositionBackground(
        world,background,x,y,width,height,topLayer
    );
}
export default addWaterBackground;
export {addWaterBackground,addFixedWaterBackground};
