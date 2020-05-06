import {AddFixedWaterBackground,Teleporter} from "../helper.js";

function GraveHell({world}) {
    world.setMap("grave-hell");
    world.camera.padding = true;
    AddFixedWaterBackground(world,2,12,6,8);
    const player = world.addPlayer(14.5,0.25);
    player.direction = "down";

    const teleporter = new Teleporter(world,[[6,8,6,22]]);

    this.interact = data => {
        if(teleporter.tryInteract(data)) return;
    }
}
export default GraveHell;
