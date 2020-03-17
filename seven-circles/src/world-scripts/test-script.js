const {ResourceManager} = Eleven;

import GenericBlaster from "../weapons/generic-blaster.js";

function TestScript(world) {
    const dispatchRenderer = world.dispatchRenderer;

    world.setMap("test");

    const player = world.addPlayer(9,7,{helloworld:2});

    player.showHitBox = false;
    player.tilesPerSecond = 2.5;

    this.interaction = (...data) => console.log(...data);

    this.load = async () => {
        ResourceManager.queueImage("player-gun.png");
        ResourceManager.queueAudio("pew.mp3");
        await ResourceManager.load();

        const playerGunImage = ResourceManager.getImage("player-gun");
        player.setWeapon(GenericBlaster,playerGunImage);
    };

    const waterBackground = new Eleven.WaterBackground(
        world.grid,world.tileset,80,112,10000
    );
    waterBackground.install(dispatchRenderer);
}

export default TestScript;
