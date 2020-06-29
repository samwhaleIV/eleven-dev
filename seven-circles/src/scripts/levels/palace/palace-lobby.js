import {AddPalaceFloor} from "../helper.js";

function PalaceLobby({world}) {
    world.setMap("palace-lobby");
    world.addPlayer(11,8,"down");
    AddPalaceFloor(world);
}
export default PalaceLobby;
