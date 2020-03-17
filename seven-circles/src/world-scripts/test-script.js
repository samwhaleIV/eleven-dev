const {ResourceManager, AudioManager, CollisionTypes} = Eleven;

import GenericBlaster from "../weapons/generic-blaster.js";

function Dummy(world,x,y) {
    this.x = x; this.y = y;
    this.width = 0.5;
    this.height = 0.5

    this.collisionType = CollisionTypes.Default;
    this.collides = true;

    this.color = "red";

    let timeout = null;
    this.onHit = projectile => {
        clearTimeout(timeout);
        AudioManager.playTone(1000,1);
        this.color = "blue";
        timeout = setTimeout(()=>this.color="red",200);
    };

    this.render = (context,x,y,width,height) => {
        context.fillStyle = this.color;
        context.fillRect(x,y,width,height);
    };
}

function TestScript(world) {
    world.setMap("test");

    world.spriteLayer.add(new Dummy(world,12,2.75));

    const player = world.addPlayer(9,10);
    player.showHitBox = false;

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
        ResourceManager.queueAudio("pew.mp3");
        await ResourceManager.load();
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
