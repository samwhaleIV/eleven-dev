import GetPlayerSprite from "../../../avatar/player.js";
import AddBloodBackground from "../backgrounds/blood-background.js";
import BoatSprite from "../sprites/boat-sprite.js";
import BoatController from "../other/boat-controller.js";

function BoatLevel({world}) {
    world.setMap("empty");

    world.camera.scale = 18;
    AddBloodBackground(world);

    const player = GetPlayerSprite(0,0,"down");

    const boat = new BoatSprite(world,player);
    boat.roundRenderPosition = true;
    boat.x = 0; boat.y = 0;
    boat.xOffset = (boat.width / -2) + 0.5; 

    world.camera.x = 0; world.camera.y = 0;

    world.spriteFollower.target = boat;
    world.spriteFollower.enable();

    world.spriteLayer.add(boat);

    boat.paddleIntensity = 2;
    boat.rightPaddlePolarity = 1;

    boat.yVelocity = 0.9;
    boat.xVelocity = 1;
    boat.angle = -60 * Math.PI / 180;

    const boatController = new BoatController(world);
}
export default BoatLevel;
