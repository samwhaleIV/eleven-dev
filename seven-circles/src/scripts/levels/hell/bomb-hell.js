function BombHell({world,fromNextMap}) {
    world.setMap("bomb-hell");
    if(!fromNextMap) {
        world.addPlayer(0,8,"right");
    } else {
        world.addPlayer(41,6,"left");
    }
    const {player} = world;
    world.camera.padding = true;
}
export default BombHell;
