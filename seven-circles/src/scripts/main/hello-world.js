function HelloWorld(world) {
    const {SaveState} = SVCC.Runtime;

    world.setMap("hell");
    const player = world.addPlayer(7,24.5);
    player.direction = 0;
}
export default HelloWorld;
