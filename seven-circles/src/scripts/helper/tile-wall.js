const setArea = (world,xStart,yStart,width,height,collision,foreground) => {
    const xEnd = xStart + width;
    const yEnd = yStart + height;
    for(let x = xStart;x<xEnd;x++) {
        for(let y = yStart;y<yEnd;y++) {
            world.setCollisionTile(x,y,collision);
            world.setForegroundTile(x,y,foreground);
        }
    }
};

function TileWall(world,x,y,width,height,tileID,startOpen) {
    const open = () => setArea(world,x,y,width,height,0,0);
    const close = () => setArea(world,x,y,width,height,1,tileID);

    let opened = startOpen;
    this.close = () => {
        if(!opened) return;
        close(); world.pushCollisionChanges();
        opened = false;
    };
    this.open = () => {
        if(opened) return;
        open(); world.pushCollisionChanges();
        opened = true;
    };
    this.toggle = () => {
        if(opened) this.close(); else this.open();
    };

    if(startOpen) open(); else close();
}
export default TileWall;
