import { ClawMachine } from "../helper.js";

function PaintHell({world}) {
    world.setMap("paint-hell");
    world.camera.padding = true;
    const player = world.addPlayer(22,2);
    player.direction = "down";

    const clawMachine = new ClawMachine(world,17,10,31,24,[[24,9]]);
    this.interact = data => {
        if(clawMachine.tryInteract(data)) return;
    }
}
export default PaintHell;
