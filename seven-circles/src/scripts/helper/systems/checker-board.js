import GetInteractionStart from "../self/get-interaction-start.js";

const RED_CHECKER_ID = 1493;
const BLUE_CHECKER_ID = 1494;
const GREEN_CHECKER_ID = 1818;
const ORANGE_CHECKER_ID = 1754;
const PURPLE_CHECKER_ID = 1755;
const PINK_CHECKER_ID = 1819;

const CHECKER_MOVE_TIME = 100;
const DELETE_INTERVAL = 350;
const DELETE_TIME = 300;

const EMPTY = Symbol("empty");

const INTERACTION_START = GetInteractionStart();

function Grid(width,height) {
    const grid = new Array(width);
    for(let x = 0;x<width;x++) {
        grid[x] = new Array(height).fill(EMPTY);
    }
    this.set = (x,y,value) => {
        return grid[x][y] = value;
    };
    const inBounds = (x,y) => {
        return x >= 0 && x < width && y >= 0 && y < height;
    }
    this.get = (x,y) => {
        if(!inBounds(x,y)) {
            return undefined;
        }
        return grid[x][y];
    };
    this.clear = (x,y) => {
        return grid[x][y] = EMPTY;
    };
}

function CheckerBoard(world,x,y,width,height,callback,matchCallback) {
    const checkerTypes = [
        RED_CHECKER_ID,
        BLUE_CHECKER_ID,
        GREEN_CHECKER_ID,
        ORANGE_CHECKER_ID,
        PURPLE_CHECKER_ID,
        PINK_CHECKER_ID
    ].reduce((pv,cv)=>{
        pv[cv] = true;
        return pv;
    },new Object());

    const allCheckers = [];

    for(let xOffset = 0;xOffset<width;xOffset++) {
        for(let yOffset = 0;yOffset<height;yOffset++) {
            const position = [x+xOffset,y+yOffset];
            const tileID = world.getForegroundTile(
                position[0],position[1]
            );
            if(!(tileID in checkerTypes)) continue;
            position.push(tileID);
            allCheckers.push(position);
        }
    }

    const grid = new Grid(width,height);

    const tryMoveCheckerSprite = (sprite,xDelta,yDelta) => {
        const startX = sprite.x;
        const startY = sprite.y;

        const endX = startX + xDelta;
        const endY = startY + yDelta;

        let nextTile = grid.get(endX-x,endY-y);

        let nestedPromise = null;

        if(nextTile === undefined) {
            return false;
        } else if(nextTile !== EMPTY) {
            nestedPromise = tryMoveCheckerSprite(nextTile,xDelta,yDelta);
            if(!nestedPromise) return false;
        }

        world.playerController.lock();
        grid.clear(startX-x,startY-y);
        grid.set(endX-x,endY-y,sprite);

        const startTime = performance.now();

        let resolver = null;

        const promises = [new Promise(resolve => resolver = resolve)];
        if(nestedPromise) promises.push(nestedPromise);

        sprite.update = time => {
            let t = (time.now - startTime) / CHECKER_MOVE_TIME;
            if(t < 0) {
                t = 0;
            } else if(t > 1) {
                t = 1;
            }
            sprite.x = startX + xDelta * t;
            sprite.y = startY + yDelta * t;
            if(t === 1) {
                if(resolver) resolver();
                sprite.update = null;
                world.playerController.unlock();
            }
        };

        return Promise.all(promises);
    };

    const requiredMatches = allCheckers.length / 3;
    let totalMatches = 0;

    const checkers = {};

    const removeCheckerFromWorld = checker => {
        world.spriteLayer.remove(checker.ID);
    };

    const interactionTable = new Object();

    const removeChecker = (checker,deleteStart) => {
        delete checkers[checker.checkerID];
        delete interactionTable[checker.interactionID];

        grid.clear(checker.x-x,checker.y-y);

        const startX = checker.x, startY = checker.y;

        checker.update = time => {
            let t = (time.now - deleteStart) / DELETE_TIME;
            if(t < 0) {
                t = 0;
            } else if(t >= 1) {
                t = 1;
                removeCheckerFromWorld(checker);
            }
            checker.width = 1 - t, checker.height = 1 - t;
            t /= 2;
            checker.x = startX + t, checker.y = startY + t;
        };
    };

    const isSameChecker = (x,y,type) => {
        const value = grid.get(x,y);
        return value && value !== EMPTY && value.type === type;
    };

    const isDirectionalMatch = (x,y,type,horizontal) => {
        const [xDelta,yDelta] = horizontal ? [1,0] : [0,1];

        const next = isSameChecker(x+xDelta,y+yDelta,type);
        const last = isSameChecker(x-xDelta,y-yDelta,type);

        if(next && last) {
            return [
                grid.get(x-xDelta,y-yDelta),
                grid.get(x,y),
                grid.get(x+xDelta,y+yDelta)
            ];
        } else if(next) {
            if(isSameChecker(x+xDelta*2,y+yDelta*2,type)) {
                return [
                    grid.get(x,y),
                    grid.get(x+xDelta,y+yDelta),
                    grid.get(x+xDelta*2,y+yDelta*2)
                ];
            } else {
                return false;
            }
        } else if(last) {
            if(isSameChecker(x-xDelta*2,y-yDelta*2,type)) {
                return [
                    grid.get(x-xDelta*2,y-yDelta*2),
                    grid.get(x-xDelta,y-yDelta),
                    grid.get(x,y)
                ];
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    const isHorizontalMatch = (x,y,type) => {
        return isDirectionalMatch(x,y,type,true);
    };
    const isVerticalMatch = (x,y,type) => {
        return isDirectionalMatch(x,y,type,false);
    };

    const isMatch = (x,y,type) => {
        const horizontalMatch = isHorizontalMatch(x,y,type);
        if(horizontalMatch) return horizontalMatch;

        const verticalMatch = isVerticalMatch(x,y,type);
        if(verticalMatch) return verticalMatch;

        return false;
    };

    const allMatchesMade = () => {
        if(callback) callback();
    };

    const findMatches = () => {
        const droppedCheckers = {};
        const dropChecker = (checker,deleteStart) => {
            removeChecker(checker,deleteStart);
            droppedCheckers[checker.checkerID] = true;
        };
        let madeMatch = false;
        for(const [checkerID,checker] of Object.entries(checkers)) {

            if(checkerID in droppedCheckers) continue;
            const gridX = checker.x - x, gridY = checker.y - y;

            const matchData = isMatch(gridX,gridY,checker.type);
            if(!matchData) continue;

            const deleteStartTime = performance.now();
            for(let i = 0;i<matchData.length;i++) {
                const checker = matchData[i];
                dropChecker(checker,deleteStartTime+i*DELETE_INTERVAL);
            }

            madeMatch = true;

            if(matchCallback) matchCallback();
            if(++totalMatches >= requiredMatches) {
                allMatchesMade();
                break;
            }
        }
        return madeMatch;
    };

    const getCheckers = () => {
        const checkerSprites = [];
        for(const checkerData of Object.entries(checkers)) {
            checkerSprites.push(checkerData[1]);
        }
        return checkerSprites;
    };
    const clearCheckerCollision = () => {
        for(const checker of getCheckers()) {
            const x = Math.floor(checker.x), y = Math.floor(checker.y);
            world.setCollisionTile(x,y,0);
            world.setInteractionTile(x,y,0);
        }
    };
    const updateCheckerCollision = () => {
        for(const checker of getCheckers()) {
            const x = Math.floor(checker.x), y = Math.floor(checker.y);
            world.setCollisionTile(x,y,1);
            world.setInteractionTile(x,y,checker.interactionID);
        }
        world.pushTileChanges();
    };

    const tryMoveChecker = async(sprite,source) => {
        if(!(sprite.checkerID in checkers)) {
            return;
        }
        let didMove = false;
        switch(source.direction) {
            case 0: didMove = tryMoveCheckerSprite(sprite,0,-1); break;
            case 1: didMove = tryMoveCheckerSprite(sprite,1,0); break;
            case 2: didMove = tryMoveCheckerSprite(sprite,0,1); break;
            case 3: didMove = tryMoveCheckerSprite(sprite,-1,0); break;
        }
        if(!didMove) {
            world.playSound("CheckerCantMove");
            return;
        }
        world.playSound("CheckerMove");

        clearCheckerCollision();
        await didMove;
        if(findMatches()) {
            world.playSound("CheckerMatch");
        }
        updateCheckerCollision();
    };

    let checkerID = 0;
    const addCheckerSprite = (worldX,worldY,type) => {
        const tileSprite = world.addTileSprite(worldX,worldY,type,true);
        tileSprite.type = type;
        const currentID = checkerID++;
        tileSprite.checkerID = currentID;
        tileSprite.collides = false;
        checkers[currentID] = tileSprite;
        const interactionID = INTERACTION_START + checkerID;
        tileSprite.interactionID = interactionID;
        interactionTable[interactionID] = tileSprite;
        world.setInteractionTile(worldX,worldY,interactionID);
        grid.set(worldX-x,worldY-y,tileSprite);
        return tileSprite;
    };

    const mapCheckers = checkers => {
        checkers.forEach(([x,y,type]) => {
            world.setCollisionTile(x,y,1);
            world.setForegroundTile(x,y,0);
            addCheckerSprite(x,y,type);
        });
    };

    mapCheckers(allCheckers);

    allCheckers.splice(0);

    this.tryInteract = ({value}) => {
        if(value in interactionTable) {
            tryMoveChecker(interactionTable[value],world.player);
            return true;
        }
        return false;
    };
}
export default CheckerBoard;
