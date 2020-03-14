import World from "./src/world.js";

Eleven.CanvasManager.start({
    frame: World,
    parameters: [
        null,world => {
            world.setMap("template");
            world.dispatchRenderer.addBackground((context,size)=>{
                context.fillStyle = "green";
                context.fillRect(0,0,size.width,size.height);
            });
            const player = world.addPlayer();
            player.x = 15.5;
            player.y = 26;
        }
    ],
    markLoaded: true
});
