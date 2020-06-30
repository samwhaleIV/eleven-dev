import {AddPalaceFloor} from "../helper.js";

function AlicePalace({world}) {
    world.setMap("alice-palace");
    world.camera.verticalPadding = true;
    AddPalaceFloor(world);
    world.addPlayer(8.545,2.9375,"down");
    world.player.hitBox.width = 0.8;
}
export default AlicePalace;
