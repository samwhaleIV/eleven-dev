const {PlayerController} = Eleven;

const MOVEMENT_HAS_NO_INTENT = () => {
    console.warn("Did you mean to move by neither X nor Y? Both deltas are 0.");
};

const Directions = Object.freeze({
    Up: 0, Right: 1, Down: 2, Left: 3
});

function ControllerRC(sprite,controller) {
    let movementData = null;

    this.setDirection = direction => {
        if(!movementData && direction in Directions) {
            sprite.direction = Directions[direction];
        }
    };

    const endMovement = () => {
        if(movementData && movementData.resolve) movementData.resolve();
        movementData = null;
        controller.inputActive = false;
    };

    sprite.addUpdate(()=>{
        if(!movementData) return;

        if(controller.colliding) {
            endMovement(); return;
        }

        const {polarity, pos, horizontal} = movementData;

        const value = sprite[horizontal ? "x" : "y"];

        if((polarity && value > pos) || (!polarity && pos > value)) {
            endMovement();
        }
    });

    this.move = (x,y) => {
        endMovement();
        controller.inputActive = true;

        movementData = new Object();
        
        if(x !== undefined && !y) {
            movementData.horizontal = true;

            movementData.pos = sprite.x + x;

            if(x < 0) {
                sprite.direction = Directions.Left;
                movementData.polarity = false;
            } else {
                sprite.direction = Directions.Right;
                movementData.polarity = true;
            }
        } else if(y !== undefined && !x) {
            movementData.horizontal = false;

            movementData.pos = sprite.y + y;

            if(y < 0) {
                sprite.direction = Directions.Down;
                movementData.polarity = false;
            } else {
                sprite.direction = Directions.Up;
                movementData.polarity = true;
            }
        } else {
            MOVEMENT_HAS_NO_INTENT(); return;
        }

        return new Promise(resolve=>movementData.resolve = resolve);
    };

    this.attack = () => {
        if(sprite.hasWeapon()) sprite.attack();
    };
}

function NPCController() {
    const {collisionLayer, tileCollision} = this.world;

    const baseController = new PlayerController(this,collisionLayer,tileCollision);

    this.controller = new ControllerRC(this,baseController);
}
export default NPCController;
