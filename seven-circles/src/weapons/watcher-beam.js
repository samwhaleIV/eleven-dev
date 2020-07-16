const NAME = "watcher-beam";

const beamColor = "#FF0000";
const beamDistance = 3.95;

const beamHorizontalOffset = 12 / 16;
const beamVerticalOffset = 5 / 16;

const beamConnectionOffset = 0.05;

function BeamSprite(owner,world) {

    this.x = 0; this.y = 0;
    this.width = 0; this.height = 0;
    this.collides = true;
    this.isVertical = false;
    this.collisionType = Eleven.CollisionTypes.LivingTrigger;

    const bindUp = () => {
        this.y = owner.y - beamDistance + beamConnectionOffset;
        this.x = owner.x + beamHorizontalOffset;
        this.width = 8 / 16;
        this.height = beamDistance;
        this.isVertical = true;
    };
    const bindDown = () => {
        this.y = owner.y + owner.height - beamConnectionOffset;
        this.x = owner.x + beamHorizontalOffset;
        this.width = 8 / 16;
        this.height = beamDistance;
        this.isVertical = true;
    };
    const bindRight = () => {
        this.x = owner.x + owner.width - beamConnectionOffset;
        this.y = owner.y + beamVerticalOffset;
        this.width = beamDistance;
        this.height = 3 / 16;
        this.isVertical = false;
    };
    const bindLeft = () => {
        this.x = owner.x - beamDistance + beamConnectionOffset;
        this.y = owner.y + beamVerticalOffset;
        this.width = beamDistance;
        this.height = 3 / 16;
        this.isVertical = false;
    };

    const bindMatrix = [bindUp,bindRight,bindDown,bindLeft];
    this.update = () => bindMatrix[owner.direction]();
    
    const sendCollision = () => {
        if(world.script.watcherBeamCollided) {
            world.script.watcherBeamCollided();
        }
    };

    this.checkCollision = () => {
        let collisionResult = world.collisionLayer.collides(this);
        if(!collisionResult) return;
        if(collisionResult.isHitBox) {
            collisionResult = collisionResult.target;
        }
        if(collisionResult.isPlayer) sendCollision();
    };
    this.trigger = data => {
        console.log(data);
        if(data.isPlayer) sendCollision();
    };

    this.roundRenderLocation = true;

    this.render = (context,x,y,width,height) => {
        context.fillStyle = beamColor;
        if(this.isVertical) {
            width /= 2;
            context.beginPath();
            const pixelSize = (width / this.width * 2) / 16;
            const beamWidth = 3 * pixelSize;

            context.rect(x,y,beamWidth,height);
    
            context.rect(x + pixelSize * 5,y,beamWidth,height);
            context.fill();
        } else {
            context.fillRect(x,y,width,height);
        }
    };
}

function WatcherBeam() {
    const spriteSize = 32;

    const image = Eleven.ResourceManager.getImage("weapon/watcher-beam");
    this.name = NAME;

    let beamSpriteID = null;
    const beamSprite = new BeamSprite(this.owner,this.world);
    this.owner.zIndex = this.world.player.zIndex + 1;

    const {spriteLayer} = this.world;
    this.unload = () => spriteLayer.remove(beamSpriteID);
    this.load = () => spriteLayer.add(beamSprite,this.owner.zIndex - 1);

    this.checkCollision = async () => {
        await frameDelay();
        beamSprite.checkCollision();
    };

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;
        const textureX = directionMatrix[direction];
        context.drawImage(image,textureX,0,spriteSize,spriteSize,x,y,width,height);
    };
}

Object.defineProperty(WatcherBeam,"name",{value:NAME,enumerable:true});

export default WatcherBeam;
