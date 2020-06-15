import {AddColorBackground} from "../helper.js";

const {ResourceManager} = Eleven;

function NPCCLTest({world}) {
    world.setMap("test-chamber");
    const player = world.addPlayer(5.660714285714286,12.464285714285714);
    player.direction = "down";
    world.camera.padding = false;
    AddColorBackground(world,"black");

    world.camera.scale = 7
    world.player.velocity = 15;

    const npc = world.addNPC(13,7,ResourceManager.getImage("the-watcher"),2,2);
    //npc.velocity = player.velocity;
    npc.x += Math.random() * 2;
    npc.y += Math.random() * 2;

    player.showHitBox = true;
    npc.showHitBox = false;

    this.start = () => {
        (async () => {
            const {controller} = npc;
            let i = 0;
            while(true) {
                switch(i++%4) {
                    case 0: await controller.move(-5,0); break;
                    case 1: await controller.move(0,-5); break;
                    case 2: await controller.move(5,0); break;
                    case 3: await controller.move(0,5); break;
                }
            }
        })();
        return false;

    };
}
export default NPCCLTest;
