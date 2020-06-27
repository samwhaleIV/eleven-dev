const WildCard = "*";

const arrayTo9Grid = array => {
    return {
        topLeft: array[0][0],
        top: array[0][1],
        topRight: array[0][2],

        left: array[1][0],
        middle: array[1][1],
        right: array[1][2],

        bottomLeft: array[2][0],
        bottom: array[2][1],
        bottomRight: array[2][2]
    }
};

const hash9Grid = nineGrid => {
    if(Array.isArray(nineGrid)) nineGrid = arrayTo9Grid(nineGrid);
    const {
        topLeft,top,topRight,
        left,middle,right,
        bottomLeft,bottom,bottomRight
    } = nineGrid;
    return [
        topLeft,top,topRight,
        left,middle,right,
        bottomLeft,bottom,bottomRight
    ].join(",");
};

const scorePattern = (a,b) => {
    a = a.split(","), b = b.split(",");
    let matches = 0;
    for(let i = 0;i<a.length;i++) {
        const av = a[i], bv = b[i];
        const isEqual = av === bv;
        if(isEqual || av === WildCard || bv === WildCard) {
            if(isEqual && i !== 4) matches += 1; //might need to remove i !== 4
            continue;
        } else {
            return 0;
        }
    }
    return matches;
};

function FloorPlan({
    world,protoFloor,protoWall,background,
    shadowMatrix,wallMatrix,floorValues
}) {
    const floorMatrices = Object.entries({
        [hash9Grid([
            //Left wall
            [WildCard,WildCard,WildCard],
            [protoWall,protoFloor,WildCard],
            [WildCard,WildCard,WildCard]
        ])]: [[0,0,shadowMatrix[1][0]]],
        [hash9Grid([
            //L corner
            [protoWall,protoWall,WildCard],
            [protoWall,protoFloor,WildCard],
            [WildCard,WildCard,WildCard]
        ])]: [[0,0,shadowMatrix[0][0]]],
        [hash9Grid([
            //Top wall
            [WildCard,protoWall,WildCard],
            [WildCard,protoFloor,WildCard],
            [WildCard,WildCard,WildCard]
        ])]: [[0,0,shadowMatrix[0][1]]],
        [hash9Grid([
            //Inverse corner
            [protoWall,protoFloor,WildCard],
            [protoFloor,protoFloor,WildCard],
            [WildCard,WildCard,WildCard]
        ])]: [[0,0,shadowMatrix[1][1]]],
    });

    const WildCardRow = new Array(3).fill(WildCard);

    const wallMatricesInner = Object.entries({
        //Simple walls
        [hash9Grid([ //Right
            WildCardRow,
            [WildCard,protoFloor,protoWall],
            WildCardRow
        ])]: [[0,0,wallMatrix.inner.full[1][2]]],
        [hash9Grid([ //Left
            WildCardRow,
            [protoWall,protoFloor,WildCard],
            WildCardRow
        ])]: [[0,0,wallMatrix.inner.full[1][0]]],
        [hash9Grid([ //Top
            WildCardRow,
            [WildCard,protoFloor,WildCard],
            [WildCard,protoWall,WildCard],
        ])]: [[0,0,wallMatrix.inner.full[2][1]]],
        [hash9Grid([ //Bottom
            [WildCard,protoWall,WildCard],
            [WildCard,protoFloor,WildCard],
            WildCardRow
        ])]: [[0,0,wallMatrix.inner.full[0][1]]],

        //Corner pieces
        [hash9Grid([
            //Top left corner
            [protoWall,protoWall,WildCard],
            [protoWall,protoFloor,WildCard],
            WildCardRow
        ])]: [[0,0,wallMatrix.inner.full[0][0]]],
        [hash9Grid([
            //Top right corner
            [WildCard,protoWall,protoWall],
            [WildCard,protoFloor,protoWall],
            WildCardRow
        ])]: [[0,0,wallMatrix.inner.full[0][2]]],
        [hash9Grid([
            //Bottom left corner
            WildCardRow,
            [protoWall,protoFloor,WildCard],
            [protoWall,protoWall,WildCard]
        ])]: [[0,0,wallMatrix.inner.full[2][0]]],
        [hash9Grid([
            //Bottom right corner
            WildCardRow,
            [WildCard,protoFloor,protoWall],
            [WildCard,protoWall,protoWall]
        ])]:[[0,0,wallMatrix.inner.full[2][2]]],
    
        //Inverse corners
        [hash9Grid([
            //Top left corner
            [protoWall,protoFloor,WildCard],
            [protoFloor,protoFloor,WildCard],
            WildCardRow
        ])]: [[0,0,wallMatrix.inner.inverse[1][1]]],
        [hash9Grid([
            //Top right corner
            [WildCard,protoFloor,protoWall],
            [WildCard,protoFloor,protoFloor],
            WildCardRow
        ])]: [[0,0,wallMatrix.inner.inverse[1][0]]],
        [hash9Grid([
            //Bottom left corner
            WildCardRow,
            [protoFloor,protoFloor,WildCard],
            [protoWall,protoFloor,WildCard],
        ])]: [[0,0,wallMatrix.inner.inverse[0][1]]],
        [hash9Grid([
            //Bottom right corner
            WildCardRow,
            [WildCard,protoFloor,protoFloor],
            [WildCard,protoFloor,protoWall]
        ])]: [[0,0,wallMatrix.inner.inverse[0][0]]]
    });

    const wallMatricesOuter = Object.entries({
        //Simple walls
        [hash9Grid([ //Right
            WildCardRow,
            [0,protoWall,protoFloor],
            WildCardRow
        ])]: [[0,0,wallMatrix.outer.full[1][2]]],
        [hash9Grid([ //Left
            WildCardRow,
            [protoFloor,protoWall,0],
            WildCardRow
        ])]: [[0,0,wallMatrix.outer.full[1][0]]],

        [hash9Grid([ //Top
            [WildCard,0,WildCard],
            [WildCard,protoWall,WildCard],
            [WildCard,protoFloor,WildCard],

        ])]: [[0,0,wallMatrix.outer.full[2][1]]],
        [hash9Grid([ //Bottom
            [WildCard,protoFloor,WildCard],
            [WildCard,protoWall,WildCard],
            [WildCard,0,WildCard]
        ])]: [[0,0,wallMatrix.outer.full[0][1]]],

        //Corner pieces
        [hash9Grid([
            //Top left corner
            [0,protoWall,WildCard],
            [protoWall,protoWall,protoFloor],
            WildCardRow
        ])]: [[0,0,wallMatrix.outer.full[2][2]]],
        [hash9Grid([
            //Top right corner
            [WildCard,protoWall,0],
            [protoFloor,protoWall,protoWall],
            WildCardRow
        ])]: [[0,0,wallMatrix.outer.full[2][0]]],
        [hash9Grid([
            //Bottom left corner
            WildCardRow,
            [protoWall,protoWall,protoFloor],
            [0,protoWall,WildCard]
        ])]: [[0,0,wallMatrix.outer.full[0][2]]],
        [hash9Grid([
            //Bottom right corner
            WildCardRow,
            [protoFloor,protoWall,protoWall],
            [WildCard,protoWall,0]
        ])]: [[0,0,wallMatrix.outer.full[0][0]]],

        //Inverse corners
        [hash9Grid([
            //Top left corner
            WildCardRow,
            [WildCard,protoWall,protoWall],
            [WildCard,protoWall,WildCard]
        ])]: [[0,0,wallMatrix.outer.inverse[0][0]]],
        [hash9Grid([
            //Top right corner
            [WildCard,protoWall,WildCard],
            [WildCard,protoWall,protoWall],
            WildCardRow,
        ])]: [[0,0,wallMatrix.outer.inverse[1][0]]],
        [hash9Grid([
            //Bottom left corner
            WildCardRow,
            [protoWall,protoWall,WildCard],
            [WildCardRow,protoWall,WildCard],
        ])]: [[0,0,wallMatrix.outer.inverse[0][1]]],
        [hash9Grid([
            //Bottom right corner
            [WildCard,protoWall,WildCard],
            [protoWall,protoWall,WildCard],
            WildCardRow,
        ])]: [[0,0,wallMatrix.outer.inverse[1][1]]],
    });

    const {grid} = world;
    const {width,height} = grid;

    const getBackground = (x,y) => world.get(x,y,0);

    const changeBuffer = new Array();

    const get9Grid = (x,y) => {
        return {
            topLeft: getBackground(x-1,y-1),
            top: getBackground(x,y-1),
            topRight: getBackground(x+1,y-1),

            left: getBackground(x-1,y),
            middle: getBackground(x,y),
            right: getBackground(x+1,y),

            bottomLeft: getBackground(x-1,y+1),
            bottom: getBackground(x,y+1),
            bottomRight: getBackground(x+1,y+1)
        }
    };

    const setBackground = (x,y,value) => changeBuffer.push([x,y,value,0]);
    const setSuperForeground = (x,y,value) => changeBuffer.push([x,y,value,2]);
    const setCollision = (x,y,value) => changeBuffer.push([x,y,value,3]);

    const patternMatch = (x,y,hash,hashSet,painter) => {
        let bestResultValue = 0, bestChangeSet = [];
        for(const [targetHash,changeSet] of hashSet) {
            const score = scorePattern(hash,targetHash);
            if(score > bestResultValue) {
                bestResultValue = score;
                bestChangeSet = changeSet;
            }
        }
        for(const [xOffset,yOffset,value] of bestChangeSet) {
            painter(x+xOffset,y+yOffset,value);
        }
        return bestChangeSet.length >= 1;
    };

    const selectRandom = set => set[Math.floor(Math.random()*set.length)];

    const paintFloor = (x,y) => {
        const nineGrid = get9Grid(x,y);
        const hash = hash9Grid(nineGrid);
        if(!patternMatch(x,y,hash,floorMatrices,setBackground)) {
            setBackground(x,y,selectRandom(floorValues));
        }
        patternMatch(x,y,hash,wallMatricesInner,setSuperForeground);
    };

    const paintWall = (x,y) => {
        const nineGrid = get9Grid(x,y);
        const hash = hash9Grid(nineGrid);
        patternMatch(x,y,hash,wallMatricesOuter,setSuperForeground);
        setCollision(x,y,1);
    };

    for(let x = 0;x < width;x++) {
        for(let y = 0;y < height;y++) {
            if(getBackground(x,y) === 0) setBackground(x,y,background);
        }
    }

    for(let x = 0;x < width;x++) {
        for(let y = 0;y < height;y++) {
            const value = getBackground(x,y);
            if(value === protoFloor) {
                paintFloor(x,y);
            } else if(value === protoWall) {
                paintWall(x,y);
            }
        }
    }

    console.log("The floor plan has " + changeBuffer.length + " tile changes.");
    for(const [x,y,value,layer] of changeBuffer) {
        world.set(x,y,value,layer);
    }
}
export default FloorPlan;
