import {AddFixedWaterBackground} from "../helper.js";

function GraveHell({world}) {
    world.setMap("grave-hell");
    world.camera.padding = true;
    AddFixedWaterBackground(world,2,12,6,8);
    const player = world.addPlayer(14.5,0.25);
    player.direction = "down";
}
export default GraveHell;
