const FIRE_TIMEOUT = 60;
const PROJECTILE_VELOCITY = 13;
const PROJECTILE_COLOR = "black";

const PROJECTILE_MAX_DISTANCE = 20;

const DECAY_DURATION = 35;
const DECAY_SIZE = 0.075;
const DECAY_COLOR = "orange";
const DECAY_OFFSET = 0.025;

const makeProjectilePoint = (x,y,behind) => {
    return {x:x/16,y:y/16,behind};
};

const DEFAULT_PROJECTILE_POINTS = Object.freeze({
    0: makeProjectilePoint(11.5,11.6,true), //up
    1: makeProjectilePoint(10,12.1,true),   //right
    2: makeProjectilePoint(4.6,11.6,false), //down
    3: makeProjectilePoint(6,12.1,true)     //left
});

function DecayEffect(x,y,terminate) {
    const duration = DECAY_DURATION;
    const start = performance.now();

    const decayDeviation = () => Math.random() * DECAY_OFFSET - DECAY_OFFSET / 2;

    this.x = x + decayDeviation();
    this.y = y + decayDeviation();

    this.width = DECAY_SIZE; this.height = 0;

    this.color = DECAY_COLOR;

    this.render = (context,x,y,width,height,time) => {
        let delta = (time.now - start) / duration;
        if(delta > 1) {
            terminate(); return;
        } else if(delta < 0) {
            delta = 0;
        }

        x = Math.floor(x); y = Math.floor(y);
        context.beginPath();
        context.arc(x,y,width - width * delta,Math.PI * 2,0);
        context.fillStyle = this.color;
        context.fill();
    };
}

function Projectile(world,x,y,direction,extraVelocity,terminate) {

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

    this.collides = true;
    this.noCollide = {[Eleven.CollisionTypes.Player]:true};
    this.collisionType = Eleven.CollisionTypes.PlayerProjectile;

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
        const collides = world.collisionLayer.collides(this);

        if(collides) {
            if(collides && collides.isHitBox) collides = collides.target;

            switch(direction) {
                case 1: this.x = collides.x; break;
                case 2: this.y = collides.y; break;

                case 3: this.x = collides.x + collides.width - this.width / 2; break;
                case 0: this.y = collides.y + collides.height - this.height / 2; break;

            }
            
            this.x += this.width / 2;
            this.y += this.height / 2;

            if(collides.onHit) collides.onHit(this);
            let particleEffectID;
            particleEffectID = world.spriteLayer.add(new DecayEffect(this.x,this.y,()=>{
                world.spriteLayer.remove(particleEffectID);
            },collides.zIndex + 1));
            terminate();
            return;
        }

        if(collides || Math.abs(totalChange) > PROJECTILE_MAX_DISTANCE) {
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
        
        const extraVelocity = this.owner.moving ? this.owner.velocity : 0;
        projectileID = this.world.spriteLayer.add(
            new Projectile(this.world,x,y,direction,extraVelocity,()=>{
                this.world.spriteLayer.remove(projectileID);
            }),zIndex
        );
    };

    const asyncFire = () => {
        const delay = performance.now();
        requestAnimationFrame(()=>{
            fireStart = performance.now() - delay;
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
