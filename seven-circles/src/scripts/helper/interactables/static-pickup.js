function StaticPickup(
    world,x,y,item,
    amount=1,
    isSuperForeground=false,
    clearCollision=true
) {
    let grabbed = false;
    this.item = item; item = null;
    this.grab = () => {
        if(grabbed) return null;
        grabbed = true;
        if(isSuperForeground) {
            world.setSuperForegroundTile(x,y,0);
        } else {
            world.setForegroundTile(x,y,0);
        }
        if(clearCollision) {
            world.setCollisionTile(x,y,0);
            world.pushCollisionChanges();
        }
        world.setInteractionTile(x,y,0);
        world.pushInteractionChanges();

        world.inventory.give(this.item,amount);
        return this.item;
    };
}
export default StaticPickup;
