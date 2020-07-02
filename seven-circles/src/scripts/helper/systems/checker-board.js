const RED_CHECKER_ID = 1493;
const BLUE_CHECKER_ID = 1494;

const CHECKER_TYPES = {
    [RED_CHECKER_ID]: true,
    [BLUE_CHECKER_ID]: true
};

const CHECKER_MOVE_TIME = 100;
const DELETE_INTERVAL = 350;
const DELETE_TIME = 300;

const EMPTY = Symbol("empty");

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
        if(!inBounds) {
            return undefined;
        }
        return grid[x][y];
    };
    this.clear = (x,y) => {
        return grid[x][y] = EMPTY;
    };
}

function CheckerBoard(world,x,y,width,height,callback) {
    const redCheckers = [], blueCheckers = [];

    for(let xOffset = 0;xOffset<width;xOffset++) {
        for(let yOffset = 0;yOffset<height;yOffset++) {
            const position = [x+xOffset,y+yOffset];
            const tileID = world.getForegroundTile(
                position[0],position[1]
            );
            if(!(tileID in CHECKER_TYPES)) continue;
            if(tileID === RED_CHECKER_ID) {
                redCheckers.push(position);
            } else {
                blueCheckers.push(position);
            }
        }
    }

    const grid = new Grid(width,height);

    const tryMoveCheckerSprite = (sprite,xDelta,yDelta) => {
        const startX = sprite.x;
        const startY = sprite.y;

        const endX = startX + xDelta;
        const endY = startY + yDelta;

        let nextTile = grid.get(endX-x,endY-y);

        if(nextTile === undefined) {
            return false;
        } else if(nextTile !== EMPTY) {
            if(!tryMoveCheckerSprite(nextTile,xDelta,yDelta)) {
                return false;
            }
        }

        world.playerController.lock();
        grid.clear(startX-x,startY-y);
        grid.set(endX-x,endY-y,sprite);

        const startTime = performance.now();

        let resolver = null;

        const promise = new Promise(resolve => resolver = resolve);

        sprite.update = time => {
            let t = (time.now - startTime) / CHECKER_MOVE_TIME;
            if(t < 0) {
                t = 0;
            } else if(t >= 1) {
                t = 1;
                world.playerController.unlock();
                if(resolver) resolver();
                sprite.update = null;
            }
            sprite.x = startX + xDelta * t;
            sprite.y = startY + yDelta * t;
        };

        return promise;
    };

    const requiredMatches = (
        redCheckers.length + blueCheckers.length
    ) / 3;
    let totalMatches = 0;

    const checkers = {};

    const removeCheckerFromWorld = checker => {
        world.spriteLayer.remove(checker.ID);
    };

    const removeChecker = (checker,deleteStart) => {
        delete checkers[checker.checkerID];
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

            if(++totalMatches >= requiredMatches) {
                allMatchesMade();
                return;
            }
        }
    };

    const getCheckerInteraction = sprite => {
        return async data => {
            if(!(sprite.checkerID in checkers)) {
                return;
            }
            let didMove = false;
            switch(data.source.direction) {
                case 0: didMove = tryMoveCheckerSprite(sprite,0,-1); break;
                case 1: didMove = tryMoveCheckerSprite(sprite,1,0); break;
                case 2: didMove = tryMoveCheckerSprite(sprite,0,1); break;
                case 3: didMove = tryMoveCheckerSprite(sprite,-1,0); break;
            }
            if(didMove) {
                await didMove;
                findMatches();
            }
        }
    };

    let checkerID = 0;
    const addCheckerSprite = (worldX,worldY,type) => {
        const tileSprite = world.addTileSprite(worldX,worldY,type,true);
        tileSprite.type = type;
        const currentID = checkerID++;
        tileSprite.checkerID = currentID;
        checkers[currentID] = tileSprite;
        tileSprite.interact = getCheckerInteraction(tileSprite);
        grid.set(worldX-x,worldY-y,tileSprite);
        return tileSprite;
    };

    const mapCheckers = (checkers,type) => {
        checkers.forEach(([x,y]) => {
            world.setCollisionTile(x,y,0);
            world.setForegroundTile(x,y,0);
            addCheckerSprite(x,y,type);
        });
    };

    mapCheckers(blueCheckers,BLUE_CHECKER_ID);
    mapCheckers(redCheckers,RED_CHECKER_ID);

    blueCheckers.splice(0), redCheckers.splice(0);
}
export default CheckerBoard;
