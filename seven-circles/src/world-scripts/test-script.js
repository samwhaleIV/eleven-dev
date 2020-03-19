const {ResourceManager, CollisionTypes} = Eleven;

import GenericBlaster from "../weapons/generic-blaster.js";
import Alignments from "../avatar/alignments.js";

function TestScript(world) {
    world.setMap("test");

    const player = world.addPlayer(9,8);

    this.interaction = async data => {
        if(data.value === 8) {
            (async () => {
                await world.showMessageInstant("You found a shooting thing!");
                const playerGunImage = ResourceManager.getImage("player-gun");
                player.setWeapon(GenericBlaster,playerGunImage);
            })();
        }
    }

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
                await new Promise(resolve=>setTimeout(resolve,1500));
                await NPC.controller.move(0,1);
            }
        })();

        NPC.x -= 3.6969696969695345346211;
        NPC.y += 1.2312312543534534234234;

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
