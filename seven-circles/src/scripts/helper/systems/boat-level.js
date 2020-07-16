import GetPlayerSprite from "../../../avatar/player.js";
import AddBloodBackground from "../backgrounds/blood-background.js";
import BoatSprite from "../sprites/boat-sprite.js";
import BoatController from "../self/boat-controller.js";

function BoatLevel({world}) {
    world.setMap("empty");

    world.camera.scale = 18;
    AddBloodBackground(world);

    const player = GetPlayerSprite(0,0,"down");
    player.collides = false;

    const boat = new BoatSprite(world,player);
    boat.roundRenderLocation = true;
    boat.x = 0; boat.y = 0;
    boat.xOffset = (boat.width / -2) + 0.5; 

    world.camera.x = 0; world.camera.y = 0;

    world.spriteFollower.target = boat;
    world.spriteFollower.enable();

    world.spriteLayer.add(boat);

    const boatController = new BoatController(world,boat);
}
export default BoatLevel;
