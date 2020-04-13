import DoorBase from "./door-base.js";

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

    DoorBase.call(this,world,open,close,startOpen);
}
export default TileWall;
