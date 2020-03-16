function TestScript(world) {
    const dispatchRenderer = world.dispatchRenderer;

    world.setMap("test");

    const player = world.addPlayer();
    player.x = 9;
    player.y = 7;
    player.showHitBox = false;
    player.tilesPerSecond = 2.5;

    this.interaction = (...data) => console.log(...data);

    this.loadTest = () => {
        world.runScript(function(world) {
            world.setMap("test");

            const player = world.addPlayer();
            player.x = 9;
            player.y = 7;
            player.showHitBox = false;

            this.load = async () => {
                await new Promise(resolve => {
                    setTimeout(resolve,100000);
                });
            }
        });
    };

    const waterBackground = new Eleven.WaterBackground(
        world.grid,world.tileset,80,112,10000
    );
    waterBackground.install(dispatchRenderer);
}

export default TestScript;
