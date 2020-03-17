const FIRE_TIMEOUT = 120;
const PROJECTILE_VELOCITY = 10;
const PROJECTILE_COLOR = "rgba(0,0,0,1)";

const makeProjectilePoint = (x,y,behind) => {
    return {x:x/16,y:y/16,behind};
};

const DEFAULT_PROJECTILE_POINTS = Object.freeze({
    0: makeProjectilePoint(11.5,11.6,true), //up
    1: makeProjectilePoint(10,12.1,true),   //right
    2: makeProjectilePoint(4.6,11.6,false), //down
    3: makeProjectilePoint(6,12.1,true)     //left
});

function Projectile(x,y,direction,extraVelocity,terminate) {

    if(!extraVelocity) extraVelocity = 0;

    this.width = 0.2; this.height = 0.2;

    switch(direction) {
        case 2: case 0: this.width /= 2; break;
        case 1: case 3: this.height /= 2; break;
    }

    this.color = PROJECTILE_COLOR;

    this.x = x; this.y = y;

    this.x -= this.width / 2;
    this.y -= this.height / 2;

    this.collides = false;

    this.velocity = PROJECTILE_VELOCITY;

    let totalChange = 0;

    this.update = time => {
        let change = (this.velocity + extraVelocity) * (time.delta / 1000);

        switch(direction) {
            case 0: this.y -= change; break;
            case 1: this.x += change; break;
            case 2: this.y += change; break;
            case 3: this.x -= change; break;
        }
        totalChange += change;
        if(Math.abs(totalChange) > 100) {
            terminate();
        }
    };

    this.render = (context,x,y,width,height) => {
        x = Math.floor(x); y = Math.floor(y);
        context.fillStyle = this.color;
        context.fillRect(x,y,width,height);
    }
}

function GenericBlaster(image,textureY,projectilePoints) {
    if(!textureY) textureY = 0;
    if(!projectilePoints) projectilePoints = DEFAULT_PROJECTILE_POINTS;

    let fireStart = null;

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;

        const textureX = directionMatrix[direction];
        context.drawImage(image,textureX,textureY,16,16,x,y,width,height);
    }

    const shoot = () => {
        let {x, y, direction} = this.owner;

        const offset = projectilePoints[direction];

        Eleven.AudioManager.play(Eleven.ResourceManager.getAudio("pew"));

        x += offset.x + (this.owner.xOffset || 0);
        y += offset.y + (this.owner.yOffset || 0);

        let zIndex = this.owner.zIndex;
        offset.behind ? zIndex-- : zIndex++;

        let projectileID;
        
        const extraVelocity = this.owner.moving ? this.owner.tilesPerSecond : 0;
        projectileID = this.world.spriteLayer.add(
            new Projectile(x,y,direction,extraVelocity,()=>{
                this.world.spriteLayer.remove(projectileID);
            }),zIndex
        );
    };

    const asyncFire = () => {
        requestAnimationFrame(()=>{
            fireStart = performance.now();
            shoot();
            (async () => {
                await Eleven.FrameBoundTimeout(FIRE_TIMEOUT);
                fireStart = null;
            })();
        });
    };

    this.attack = () => {
        if(fireStart !== null) return;
        asyncFire();
    };

}

export default GenericBlaster;
