import World from "./src/world.js";

function WorldTestScript(world) {
    const dispatchRenderer = world.dispatchRenderer;

    world.setMap("test");

    const player = world.addPlayer();
    player.x = 9;
    player.y = 7;
    player.showHitBox = false;

    const waterBackground = new Eleven.WaterBackground(
        world.grid,world.tileset,80,112,10000
    );
    waterBackground.install(dispatchRenderer);
}

Eleven.CanvasManager.start({
    frame: World,
    parameters: [world => world.runScript(WorldTestScript)],
    markLoaded: true
});
