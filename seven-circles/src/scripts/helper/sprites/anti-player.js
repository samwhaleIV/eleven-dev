function AntiPlayer(world,x,y,direction="left",interact=null) {

    const image = Eleven.ResourceManager.getImage("anti-player");
    const sprite = world.addNPC(x,y,image);

    sprite.direction = direction;
    sprite.velocity = 1.5;

    if(interact) sprite.interact = interact;

    if(world.player) {
        sprite.xOffset = world.player.xOffset;
        sprite.yOffset = world.player.yOffset;
    }

    return sprite;
}
export default AntiPlayer;
