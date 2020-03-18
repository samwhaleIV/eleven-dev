const {ResourceManager, CollisionTypes} = Eleven;

import GenericBlaster from "../weapons/generic-blaster.js";
import Alignments from "../avatar/alignments.js";

function TestScript(world) {
    world.setMap("test");

    const player = world.addPlayer(9,10);

    this.interaction = async data => {
        if(data.value === 8) {
            (async () => {
                await world.showMessageInstant("You found a shooting thing!");
                const playerGunImage = ResourceManager.getImage("player-gun");
                player.setWeapon(GenericBlaster,playerGunImage);
            })();
        }
    }

    world.spriteLayer.add(function(){
        this.x = 5; this.y = 7;
        this.width = 1; this.height = 1;

        this.collides = true;
        this.collisionType = CollisionTypes.Trigger;

        let triggered = false;
        this.hit = whomstve => {
            if(triggered) return;
            triggered = true;
            whomstve.width += 1;
            whomstve.height += 1;
            whomstve.x -= 0.5;
            whomstve.y -= 0.5;
            console.log("AHhhhhhhhhhh! get off me!");
        }
    })

    this.load = async () => {

        ResourceManager.queueImage("player-gun.png");
        ResourceManager.queueImage("enemy-gun.png");
        ResourceManager.queueImage("other.png");

        ResourceManager.queueAudio("pew.mp3");
        await ResourceManager.load();


        const NPC = world.addNPC(11,8,ResourceManager.getImage("other"));
        NPC.setWeapon(GenericBlaster,ResourceManager.getImage("enemy-gun"));

        NPC.onProjectile = async () => {
            return;
            world.playerController.lock();
            await world.showMessage("Oof, owie, my bones!");
            world.spriteLayer.remove(NPC.ID);
            await world.showMessageInstant("*dies*");
            world.playerController.unlock();
        };
    
        NPC.alignment = Alignments.Hostile;

        (async () => {
            while(true) {
                if(Math.random() > 0.5) {
                    await NPC.controller.move(Math.random() > 0.5 ? 1 : -1,0);
                } else {
                    await NPC.controller.move(0,Math.random() > 0.5 ? 1 : -1);
                }
            }
        })();
        (async () => {
            while(true) {
                await new Promise(resolve=>setTimeout(resolve,100));
                NPC.controller.attack();
            }
        })();

        NPC.x -= 0.3492949239429312;

        this.NPC = NPC;

    };

    world.dispatchRenderer.addBackground((context,{width,height})=>{
        context.fillStyle = "black"; context.fillRect(0,0,width,height);
    });

    /*
    const waterBackground = new Eleven.WaterBackground(
        world.grid,world.tileset,80,112,10000
    );
    waterBackground.install(dispatchRenderer);*/
}

export default TestScript;
