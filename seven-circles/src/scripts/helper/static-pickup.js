function StaticPickup(world,x,y,item) {
    let grabbed = false;
    this.grab = () => {
        if(grabbed) return false;
        grabbed = true;
        world.setForegroundTile(x,y,0);
        world.setCollisionTile(x,y,0);
        world.pushCollisionChanges();
        SVCC.Runtime.Inventory.addItem(item);

        return true;
    };
}
export default StaticPickup;
