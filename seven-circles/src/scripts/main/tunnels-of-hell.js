const BACKGROUND_COLOR = `rgb(20,0,0)`;

function TunnelsOfHell(world) {
    world.setMap("tunnels-of-hell");
    const player = world.addPlayer(4,3.5);
    player.direction = "down";
    world.dispatchRenderer.addBackground((context,{width,height})=>{
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0,0,width,height);
    });

    this.useKey = keyType => {
        return false;
    };
}
export default TunnelsOfHell;
