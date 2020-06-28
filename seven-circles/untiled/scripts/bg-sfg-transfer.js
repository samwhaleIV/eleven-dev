const GetRange = (ID,width,height) => {
    const column = ID % 64;
    const row = Math.floor(ID / 64);
    const positions = [];
    for(let x = 0;x<width;x++) {
        for(let y = 0;y<height;y++) {
            const newID = x + column + ((y + row) * 64);
            positions.push(newID);
        }
    }
    return positions;
};

const RepairTiles = [
    7,8,610,611,
    ...GetRange(732,3,3),
    ...GetRange(607,3,3),
    ...GetRange(801,2,2),
    ...GetRange(799,2,2),
    924,988,1052,
    ...GetRange(925,2,2),
    ...GetRange(481,2,2),
    543,544,
    674,675,738,739
].reduce((set,value)=>{
    set[value] = true;
    return set;
},new Object());

function RepairFloonPlan(world) {
    console.log(world.tileRenderer);
    const {width,height} = world.grid;
    let changeCount = 0;
    for(let x = 0;x<width;x++) {
        for(let y = 0;y<height;y++) {
            const value = world.get(x,y,0);
            if(value in RepairTiles) {
                world.set(x,y,0,0);
                world.set(x,y,value,2);
                changeCount++;
            }
        }
    }
    console.log("Transferred " + changeCount + " tiles!");
}
export default RepairFloonPlan;
