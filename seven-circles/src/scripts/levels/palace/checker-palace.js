import {AddPalaceFloor} from "../helper.js";

function CheckerPalace({world}) {
    world.setMap("checker-palace");
    world.addPlayer(10,5,"down");
    AddPalaceFloor(world);
}
export default CheckerPalace;

