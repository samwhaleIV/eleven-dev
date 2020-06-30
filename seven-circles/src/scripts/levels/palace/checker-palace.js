import {AddPalaceFloor} from "../helper.js";

function CheckerPalace({world}) {
    world.setMap("checker-palace");
    world.addPlayer(9,3.5,"down");
    AddPalaceFloor(world);
    world.camera.verticalPadding = true;
}
export default CheckerPalace;

