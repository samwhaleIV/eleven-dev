const {PlayerController, CollisionTypes} = Eleven;

const DEFAULT_COLLISION = CollisionTypes.Default;

const MOVEMENT_HAS_NO_INTENT = () => {
    console.warn("Did you mean to move by neither X nor Y? Both deltas are 0.");
};

const Directions = Object.freeze({
    Up: 0, Right: 1, Down: 2, Left: 3
});

function ControllerRC(sprite) {
    let movementData = null;

    this.setDirection = direction => {
        if(!movementData && direction in Directions) {
            sprite.direction = Directions[direction];
        }
    };

    const movementStack = new Array();

    const tryAdvanceStack = () => {
        if(movementStack.length > 0) {
            const command = movementStack.shift();
            this.move(...command);
        }
    };

    const endMovement = withPos => {
        if(movementData) {
            if(movementData.resolve) {
                movementData.resolve();
            }
            if(withPos) {
                if(movementData.horizontal) {
                    sprite.x = movementData.pos;
                } else {
                    sprite.y = movementData.pos;
                }
            }
        }

        movementData = null;
        this.inputActive = false;

        tryAdvanceStack();
    };

    sprite.addUpdate(()=>{
        if(!movementData) return;
        if(sprite.colliding) {
            if(sprite.colliding.collisionType === DEFAULT_COLLISION) {
                endMovement(false);
            }
            return;
        }

        const {polarity, pos, horizontal} = movementData;

        const value = sprite[horizontal ? "x" : "y"];

        if((polarity && value > pos) || (!polarity && pos > value)) {
            endMovement(true);
        }
    });

    this.move = (x,y,resolve) => {
        if(movementStack.length > 0) {
            let resolver = null;
            const promise = new Promise(resolve=>resolver=resolve);
            movementStack.push([x,y,resolver]);
            return promise;
        }

        this.inputActive = true;

        movementData = new Object();
        
        if(x !== undefined && !y) {
            movementData.horizontal = true;

            movementData.pos = sprite.x + x;

            if(x < 0) {
                this.direction = Directions.Left;
                movementData.polarity = false;
            } else {
                this.direction = Directions.Right;
                movementData.polarity = true;
            }
        } else if(y !== undefined && !x) {
            movementData.horizontal = false;

            movementData.pos = sprite.y + y;

            if(y < 0) {
                this.direction = Directions.Up;
                movementData.polarity = false;
            } else {
                this.direction = Directions.Down;
                movementData.polarity = true;
            }
        } else {
            MOVEMENT_HAS_NO_INTENT();
            
            if(resolve) resolve();

            tryAdvanceStack();

            return;
        }

        if(resolve) { movementData.resolve = resolve; return; }
        
        return new Promise(resolve=>movementData.resolve = resolve);
    };

    this.attack = () => {
        if(sprite.hasWeapon()) sprite.attack();
    };
}

function NPCController() {
    const {collisionLayer, tileCollision} = this.world;

    const baseController = new PlayerController(this,collisionLayer,tileCollision);

    ControllerRC.call(baseController,this);

    this.controller = baseController;

}
export default NPCController;
