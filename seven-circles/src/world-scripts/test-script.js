const {ResourceManager, AudioManager, CollisionTypes} = Eleven;

import GenericBlaster from "../weapons/generic-blaster.js";

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

    this.load = async () => {

        ResourceManager.queueImage("player-gun.png");
        ResourceManager.queueImage("enemy-gun.png");
        ResourceManager.queueImage("other.png");

        ResourceManager.queueAudio("pew.mp3");
        await ResourceManager.load();


        const NPC = world.addNPC(11,8,ResourceManager.getImage("other"));
        NPC.setWeapon(GenericBlaster,ResourceManager.getImage("enemy-gun"));

        NPC.onHit = async () => {
            world.playerController.lock();
            await world.showMessage("Oof, owie, my bones!");
            world.spriteLayer.remove(NPC.ID);
            await world.showMessageInstant("*dies*");
            world.playerController.unlock();
        };

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
