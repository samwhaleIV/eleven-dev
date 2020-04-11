function StaticPickup(world,x,y,item) {
    let grabbed = false;
    this.item = item; item = null;
    this.grab = () => {
        if(grabbed) return null;
        grabbed = true;
        world.setForegroundTile(x,y,0);
        world.setCollisionTile(x,y,0);
        world.pushCollisionChanges();
        SVCC.Runtime.Inventory.addItem(this.item);
        return this.item;
    };
}
export default StaticPickup;
