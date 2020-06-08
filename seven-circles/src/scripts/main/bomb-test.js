import {InstallBombAreas,PickupField} from "../helper.js";

function BombTest({world}) {
    world.setMap("bomb-test");
    world.camera.enablePadding();

    InstallBombAreas(world,this);
    const {tileRenderer} = world;

    let playerX = 0, playerY = 0;

    const bombLocations = [];

    tileRenderer.readLayer(4).forEach((value,idx)=>{
        if(value === 16) {
            bombLocations.push(tileRenderer.getXY(idx));
        } else if(value === 17) {
            const [x,y] = tileRenderer.getXY(idx);
            playerX = x, playerY = y;
        }
    });

    const player = world.addPlayer(playerX,playerY);
    player.direction = "down";

    const pickupField = new PickupField(world,bombLocations.map(([x,y]) => [x,y,"bomb"]));

    this.interact = pickupField.tryPickup;

    this.start = () => {
        if(DEMO) (async () => {
            await delay(500);
            await world.say("That's it? The demo is over? What happens next? Is it programmed yet?\n\nStay tuned and find out more next week, six pm (Pacific Standard Time) right here on [REDACTED]!");
            world.playerController.unlock();
        })();
        return Boolean(DEMO);
    };
}
export default BombTest;
