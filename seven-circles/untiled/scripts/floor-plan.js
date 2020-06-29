import {
    getOuterWallPattern,
    getInnerWallPattern,
    getFloorShadowPattern
} from "./floor-plan-matrices.js";

const WILD_CARD = "*";

const threeByThreeMatrix = [
    [[-1,-1],[0,-1],[1,-1]],
    [[-1,0],[0,0],[1,0]],
    [[-1,1],[0,1],[1,1]]
];

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

const nineGridCenter = 4;

const scorePattern = (a,b) => {
    a = a.split(","), b = b.split(",");
    let matchCount = 0;
    for(let i = 0;i<a.length;i++) {
        const av = a[i], bv = b[i];
        const isEqual = av === bv;
        if(isEqual || av === WILD_CARD || bv === WILD_CARD) {
            if(isEqual && i !== nineGridCenter) {
                matchCount += 1;
            }
            continue;
        } else {
            return 0;
        }
    }
    return matchCount;
};

const formatMatrices = (matrices,floor,wall) => {
    const valueTable = {[WILD_CARD]: WILD_CARD, "w": wall, "f": floor};
    const formatted = new Object();
    Object.entries(matrices).forEach(([key,change])=>{
        const proto9Grid = [[],[],[]];
        const value = key.split("");
        for(let i = 0;i < 9 && value.length >= 1;i++) {
            let character = " ";
            while(character === " ") {
                character = value.shift();
            }
            if(character in valueTable) {
                character = valueTable[character];
            } else {
                character = WILD_CARD;
            }
            proto9Grid[Math.floor(i/3)].push(character);
        }
        formatted[hash9Grid(proto9Grid)] = change;
    });
    return formatted;
};

const patternMatch = (x,y,hash,hashSet,painter) => {
    let bestResultValue = 0, bestChange = null;
    for(const [targetHash,change] of hashSet) {
        const score = scorePattern(hash,targetHash);
        if(score > bestResultValue) {
            bestResultValue = score;
            bestChange = change;
        }
    }
    const hasChange = bestChange !== null;
    if(hasChange) painter(x,y,bestChange);
    return hasChange;
};

const selectRandom = set => set[Math.floor(Math.random()*set.length)];

const superForegroundLayer = 2;

function FloorPlan({
    world,protoFloor,protoWall,background,
    shadowMatrix,wallMatrix,floorValues,eraseProtoWall,
    useShadowMatrix = true,
    useInnerWallMatrix = true,
    useOuterWallMatrix = true,
    wallTargetLayer = superForegroundLayer
}) {

    if(!Array.isArray(floorValues)) floorValues = [floorValues];

    const listifyMatrices = matrices => Object.entries(
        formatMatrices(matrices,protoFloor,protoWall)
    );

    const shadowPattern = shadowMatrix && useShadowMatrix ? listifyMatrices(
        getFloorShadowPattern(shadowMatrix)
    ) : null;
    const innerWallPattern = wallMatrix && useInnerWallMatrix ? listifyMatrices(
        getInnerWallPattern(wallMatrix.inner)
    ): null;
    const outerWallPattern = wallMatrix && useOuterWallMatrix ? listifyMatrices(
        getOuterWallPattern(wallMatrix.outer)
    ) : null;

    const changeBuffer = new Array();

    const getBackground = (x,y) => {
        return world.get(x,y,0);
    };

    const backgroundLayer = 0;
    const collisionLayer = 3;

    const setBackground = (x,y,value) => {
        changeBuffer.push([x,y,value,backgroundLayer]);
    };
    const setWall = (x,y,value) => {
        changeBuffer.push([x,y,value,wallTargetLayer]);
    };
    const setCollision = (x,y,value) => {
        changeBuffer.push([x,y,value,collisionLayer]);
    };

    const get9Grid = (x,y) => {
        const getValue = ([xOffset,yOffset]) => {
            return getBackground(x+xOffset,y+yOffset);
        };
        const getRow = row => {
            return row.map(getValue);
        };
        const proto9Grid = threeByThreeMatrix.map(getRow);
        return arrayTo9Grid(proto9Grid);
    };

    const paintFloor = (x,y) => {
        const nineGrid = get9Grid(x,y);
        const hash = hash9Grid(nineGrid);

        const patternMatched = shadowPattern && patternMatch(x,y,hash,shadowPattern,setBackground);
        if(!patternMatched) {
            setBackground(x,y,selectRandom(floorValues));
        }
        if(innerWallPattern) {
            patternMatch(x,y,hash,innerWallPattern,setWall);
        }
    };

    const paintWall = (x,y) => {
        const nineGrid = get9Grid(x,y);
        const hash = hash9Grid(nineGrid);
        if(outerWallPattern) {
            patternMatch(x,y,hash,outerWallPattern,setWall);
        }
        setCollision(x,y,1);
        if(eraseProtoWall) setBackground(x,y,background);
    };

    const applyBackgroundTiles = () => {
        if(isNaN(background)) return;
        const {width,height} = world.grid;
        for(let x=0;x<width;x++) {
            for(let y=0;y<height;y++) {
                if(!getBackground(x,y)) {
                    setBackground(x,y,background);
                }
            }
        }
    };

    const iterateWorldTiles = () => {
        const paintResponseTable = {
            [protoWall]: paintWall,
            [protoFloor]: paintFloor
        };
        const {width,height} = world.grid;
        for(let x=0;x<width;x++) {
            for(let y=0;y<height;y++) {
                const value = getBackground(x,y);
                const response = paintResponseTable[value];
                if(!response) continue;
                response(x,y);
            }
        }
    };

    const pushTileChanges = () => {
        console.log(`The floor plan has ${changeBuffer.length} tile changes.`);
        for(const [x,y,value,layer] of changeBuffer) world.set(x,y,value,layer);
    };

    applyBackgroundTiles();
    iterateWorldTiles();
    pushTileChanges();
}
export default FloorPlan;
