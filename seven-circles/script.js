import World from "./src/world.js";

Eleven.CanvasManager.start({
    frame: World,
    parameters: [
        null,world => {
            world.setMap("menu");
            world.addPlayer();
        }
    ],
    markLoaded: true
});
