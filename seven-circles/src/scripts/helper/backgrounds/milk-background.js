import AddPositionBackground from "./position-background.js";

function GetMilkBackground(world) {
    const background = new Eleven.WaterBackground(
        world.grid,world.tileset,240,224,10000
    );
    background.blendMode = "multiply";
    world.dispatchRenderer.addResize(background.resize);
    return background;
}
function AddMilkBackground(world) {
    const background = GetMilkBackground(world);
    world.dispatchRenderer.addBackground(background.render);
}
function AddFixedMilkBackground(world,x,y,width,height,topLayer) {
    const background = GetMilkBackground(world);
    background.useCameraOffset = false;
    AddPositionBackground(
        world,background,x,y,width,height,topLayer
    );
}
export default AddMilkBackground;
export {AddMilkBackground,AddFixedMilkBackground};
