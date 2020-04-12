import DoorBase from "./door-base";

const setArea = (world,xStart,yStart,width,height,value) => {
    const xEnd = xStart + width;
    const yEnd = yStart + height;
    for(let x = xStart;x<xEnd;x++) {
        for(let y = yStart;y<yEnd;y++) {
            world.setCollisionTile(x,y,value);
        }
    }
};

function InvisibleWall(world,x,y,width,height,startOpen) {
    const open = () => {
        setArea(world,x,y,width,height,0);
        return true;
    };
    const close = () => {
        setArea(world,x,y,width,height,1);
        return true;
    };

    DoorBase.call(this,world,open,close,startOpen);
}
export default InvisibleWall;
