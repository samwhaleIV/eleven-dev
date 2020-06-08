import GetInteractionStart from "./get-interaction-start.js";

const HORIZONTAL_ROPE = 858;
const VERTICAL_ROPE = 859;

const HORIZONTAL_ROPE_START = 922;
const HORIZONTAL_ROPE_END = 923;

const VERTICAL_ROPE_START = 987;
const VERTICAL_ROPE_END = 1051;

const CENTER_PIECE = 921;

const CONTROL_CAMERA_TIME = 400;

const DIGITAL_VELOCITY = 3.25;
const ANALOG_VELOCITY = 4;

const DIGITAL_DOUBLE_AXIS_SCALE = 3 / 4;

const getRopeTextures = (world,isVertical) => [
    ...world.getTextureXY(isVertical ? VERTICAL_ROPE : HORIZONTAL_ROPE),
    ...world.getTextureXY(isVertical ? VERTICAL_ROPE_START : HORIZONTAL_ROPE_START),
    ...world.getTextureXY(isVertical ? VERTICAL_ROPE_END : HORIZONTAL_ROPE_END)
];

const INTERACTION_START = GetInteractionStart();

function Rope(world,isVertical,start,length) {
    const image = world.tileset, baseSize = world.grid.baseTileSize;

    const [ropeX,ropeY,startX,startY,endX,endY] = getRopeTextures(world,isVertical);

    const renderBase = (context,x,y,tileSize) => {
        context.drawImage(image,startX,startY,baseSize,baseSize,x,y,tileSize,tileSize);
    };

    if(isVertical) {
        this.width = 1, this.height = length, this.y = start;

        this.render = (context,x,y,tileSize,height) => {
            renderBase(context,x,y,tileSize);
            context.drawImage(
                image,ropeX,ropeY,baseSize,baseSize,
                x,y+tileSize,tileSize,height-tileSize*2
            );
            context.drawImage(
                image,endX,endY,baseSize,baseSize,
                x,y+height-tileSize,tileSize,tileSize
            );
        };
    } else {
        this.height = 1, this.width = length, this.x = start;

        this.render = (context,x,y,width,tileSize) => {
            renderBase(context,x,y,tileSize);
            context.drawImage(
                image,ropeX,ropeY,baseSize,baseSize,
                x+tileSize,y,width-tileSize*2,tileSize
            );
            context.drawImage(
                image,endX,endY,baseSize,baseSize,
                x+width-tileSize,y,tileSize,tileSize
            );
        };
    }
}

function CenterPiece(world,x,y,bounds,xRope,yRope) {
    this.x = x; this.y = y;
    this.width = 1; this.height = 1;

    const image = world.tileset, baseSize = world.grid.baseTileSize;
    const [textureX,textureY] = world.getTextureXY(CENTER_PIECE);

    this.xDelta = 0, this.yDelta = 0;

    this.velocityX = 1, this.velocityY = 1;

    const {minX,maxX,minY,maxY} = bounds;

    const {grid} = world;

    this.update = ({deltaSecond}) => {
        const {xDelta,yDelta,velocityX,velocityY} = this;

        if(xDelta !== 0) {
            let change = velocityX * xDelta * deltaSecond;
            change = grid.roundToPixels(change);
            
            let x = this.x + change;
            if(x < minX) x = minX; else if(x > maxX) x = maxX;
            this.x = x;
        }

        if(yDelta !== 0) {
            let change = velocityY * yDelta * deltaSecond;
            change = grid.roundToPixels(change);

            let y = this.y + change;
            if(y < minY) y = minY; else if(y > maxY) y = maxY;
            this.y = y;
        }

        xRope.y = this.y; yRope.x = this.x;
    };

    this.render = (context,x,y,width,height) => {
        context.drawImage(image,textureX,textureY,baseSize,baseSize,x,y,width,height);
    }
}

function ClawMachine(world,x1,y1,x2,y2,baseStations,clawAction) {
    const minX = x1 + 1, minY = y1 + 1;
    const maxX = x2 - 1, maxY = y2 - 1;

    const width = x2 - x1, height = y2 - y1;

    const bounds = {minX,maxX,minY,maxY};

    const verticalRope = new Rope(world,true,y1,height+1);
    const horizontalRope = new Rope(world,false,x1,width+1);

    const centerPiece = new CenterPiece(
        world,x1 + width / 2,y1 + height / 2,bounds,horizontalRope,verticalRope
    );

    world.addSprite(verticalRope), world.addSprite(horizontalRope);
    world.addSprite(centerPiece);

    const interactionIDs = {};
    if(baseStations) {
        for(let i = 0;i<baseStations.length;i++) {
            const baseStation = baseStations[i];
            const ID = INTERACTION_START + i;
            interactionIDs[ID] = baseStation;
            const [x,y] = baseStation;
            world.setInteractionTile(x,y,ID);
        }
    }
    this.baseStationIDs = interactionIDs;

    let inputProxy = null, inputUpdater = null;

    let terminating = false;

    const controllerEnd = async (animated=true) => {
        if(inputProxy) {
            inputProxy.close(); inputProxy = null;
        };

        centerPiece.xDelta = 0, centerPiece.yDelta = 0;
        world.dispatchRenderer.removeUpdate(inputUpdater);

        if(animated) {

            const {spriteFollower,camera,player,playerController} = world;
    
            spriteFollower.disable();
            await camera.moveTo(player,CONTROL_CAMERA_TIME);
    
            spriteFollower.target = player;
            spriteFollower.enable();
    
            playerController.unlock();
        }

        terminating = false;
    };

    this.exit = async () => {
        if(terminating) return;
        terminating = true;
        await controllerEnd(false);
    };

    const controllerStart = async () => {

        const {
            playerController,spriteFollower,camera,dispatchRenderer
        } = world;

        playerController.lock();
        inputProxy = world.getInputProxy();

        spriteFollower.disable();

        await camera.moveTo(
            centerPiece.x,centerPiece.y,CONTROL_CAMERA_TIME
        );

        spriteFollower.target = centerPiece;
        spriteFollower.enable();

        let downKeys = null;

        const {codes,managedGamepad} = SVCC.Runtime.InputServer;

        const processDownKeys = () => {
            if(terminating) return;
            let xDelta = 0, yDelta = 0;

            const leftAxis = managedGamepad.getLeftAxis();
            if(leftAxis.active) {
                xDelta = leftAxis.x < 0 ? -1 : 1;
                yDelta = leftAxis.y < 0 ? -1 : 1;

                const velocityX = Math.abs(leftAxis.x) * ANALOG_VELOCITY;
                const velocityY = Math.abs(leftAxis.y) * ANALOG_VELOCITY;

                centerPiece.velocityX = velocityX;
                centerPiece.velocityY = velocityY;

            } else {
                if(codes.Up in downKeys) yDelta--;
                if(codes.Down in downKeys) yDelta++;
                if(codes.Left in downKeys) xDelta--;
                if(codes.Right in downKeys) xDelta++;

                let velocity = DIGITAL_VELOCITY;
                if(xDelta !== 0 && yDelta !== 0) {
                    velocity *= DIGITAL_DOUBLE_AXIS_SCALE;
                };

                centerPiece.velocityX = velocity;
                centerPiece.velocityY = velocity;
            }

            centerPiece.xDelta = xDelta;
            centerPiece.yDelta = yDelta;
        };

        inputUpdater = dispatchRenderer.addUpdate(()=>{
            processDownKeys(); downKeys = null;
        },centerPiece.zIndex-1);

        const downKeyApplicator = keys => {
            downKeys = Object.assign(downKeys||{},keys);
        };

        const keyDown = data => {
            if(terminating) return;
            const impulse = data.impulse;
            if(impulse === codes.Click) {
                if(!clawAction) return;
                const x = Math.round(centerPiece.x);
                const y = Math.round(centerPiece.y);
                clawAction(x,y);
            } else if(impulse === codes.Exit) {
                terminating = true;
                controllerEnd();
            }
        };

        inputProxy.set({
            sendToBase: true,
            boundKeyboard: true,
            mirroredGamepad: true,
            keyDown: keyDown,
            input: downKeyApplicator,
        });
    };

    this.tryInteract = ({value}) => {
        if(value in interactionIDs) {
            controllerStart();
            return true;
        }
        return false;
    };
}
export default ClawMachine;
