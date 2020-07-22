import ProjectileBase from "./projectile-base.js";

const {ParticleSystem,ResourceManager,TextLayer} = Eleven;

const FIRE_TIMEOUT = 1000;
const NAME = "shotgun";
const IMAGE = "weapon/shotgun";
const FIRE_ANIMATION_DURATION = 50;
const RELOAD_ANIMATION_DURATION = 100;
const EMPTY_SOUND_TIMEOUT = 200;

const PELLET_COUNT = 6;
const PELLET_JITTER = 1 / 3;
const PELLET_SIZE = 0.22;
const PROJECTILE_SPEED = 18;

const DIRECTIONAL_BIAS = 1.4;
const BOOM_TIMEOUT = 1000 / 60 * 3;

const pelletColors = [
    "#FF5200","#FF0000","#FFA830"
];

const makeProjectilePoint = (x,y,behind) => {
    return {x:x/16,y:y/16,behind};
};

const PROJECTILE_POINTS = {
    0: makeProjectilePoint(10.5,10.5,true), //up
    1: makeProjectilePoint(14,10.5,true),   //right
    2: makeProjectilePoint(5.25,10.5,false), //down
    3: makeProjectilePoint(1,10.5,true)     //left
};

const getPelletOffset = () => {
    return (Math.random() - 0.5) * 2 * PELLET_JITTER;
};

let lastColorIndex = 0;
const getPelletColor = () => {
    return pelletColors[lastColorIndex = (lastColorIndex + 1) % pelletColors.length];
};
const getPellet = () => {
    return [getPelletOffset(),getPelletOffset()];
};

function ShotgunHUD(world) {
    const {grid,inventory,dispatchRenderer,player} = world;
    const image = ResourceManager.getImage("hud/shells");
    const {width,height} = image;

    let textLayer = null;

    const render = context => {
        const iconScale = world.camera.scale / 2;
        const iconWidth = iconScale * width, iconHeight = iconScale * height;    

        const iconLocation = grid.getLocation(player.camX-player.width/2,player.camY);

        context.drawImage(
            image,0,0,width,height,
            iconLocation.x,iconLocation.y,iconWidth,iconHeight
        );

        if(textLayer) {
            textLayer.render(context,iconLocation.x+iconWidth,iconLocation.y);
        }
    };

    this.update = () => {
        textLayer = new TextLayer({
            autoComplete: true,
            text: `%w${inventory.count("shells")}`,
            scale: 4, height: 64, width: 64, letterSpacing: 0
        });
    };
    let rendererID = null;
    this.delete = () => {
        if(rendererID !== null) {
            dispatchRenderer.removeFinalize(rendererID);
        }
    };
    this.add = () => {
        this.update();
        rendererID = dispatchRenderer.addFinalize(render);
    };
}

function Pellets(weapon,world,owner,x,y,terminate) {

    const color = getPelletColor();

    const pellets = new Array(PELLET_COUNT);
    for(let i = 0;i<pellets.length;i++) {
        pellets[i] = getPellet();
    }

    const render = (context,x,y,width,height) => {
        context.beginPath();
        context.fillStyle = this.color;
        for(const [xOffset,yOffset] of pellets) {
            context.rect(x+xOffset*width,y+yOffset*height,width,height);
        }
        context.fill();
    };

    let xv = 300, yv = 300;

    let width = PELLET_SIZE, height = PELLET_SIZE;

    switch(owner.direction) {
        case 2: case 0:
            yv /= DIRECTIONAL_BIAS;
            width /= DIRECTIONAL_BIAS;
            break;
        case 1: case 3:
            xv /= DIRECTIONAL_BIAS;
            height /= DIRECTIONAL_BIAS;
            break;
    }

    const particleType = ParticleSystem.getType("Base",{
        duration: 100,
        color,
        scale: t => 1 + t * 2,
        size: 8.5,
        count: Math.floor(pellets.length * 1.25),
        xv, yv
    });

    const onCollision = (collisionResult,hitBox) => {
        let {x,y} = this;


        switch(this.direction) {
            case 1: x = hitBox.x + hitBox.width * (1 / 5); break;
            case 3: x = hitBox.x + hitBox.width * (3 / 5); break;
        }

        x += this.width / 2; y += this.height / 2;

        if(weapon.shouldPlayBoomEffect()) {
            world.playSpatialSound({name:"ShotgunBoom",x,y});
        }

        const emitter = ParticleSystem.getEmitter(particleType);

        const particles = world.addParticles(x,y,emitter);

        emitter.fire(()=>{
            world.removeParticles(particles);
        });

        if(collisionResult.shot) {
            collisionResult.shot(owner);
        }
    };

    ProjectileBase({
        target: this, world, owner, width, height,
        x, y, color, velocity: PROJECTILE_SPEED,
        render, terminate, onCollision
    });
}

function Shotgun() {
    const image = Eleven.ResourceManager.getImage(IMAGE);
    this.name = NAME;

    let firing = false;
    let lastFireTime = -Infinity;

    let lastReloadTime = -Infinity;

    const getTextureY = ({now}) => {
        if(now - lastFireTime <= FIRE_ANIMATION_DURATION) {
            return 16;
        } else if(now - lastReloadTime <= RELOAD_ANIMATION_DURATION) {
            return 32;
        }
        return 0;
    };

    let shouldPlayBoomEffect = true;
    this.shouldPlayBoomEffect = () => {
        return shouldPlayBoomEffect;
    };

    this.render = (context,x,y,width,height,time) => {
        const {directionMatrix, direction} = this.owner;

        const textureY = getTextureY(time);

        const textureX = directionMatrix[direction];
        context.drawImage(
            image,textureX,textureY,16,16,x,y,width,height
        );
    };

    const shoot = () => {
        let {x, y, direction} = this.owner;

        const offset = PROJECTILE_POINTS[direction];

        x += (offset.x * this.owner.width) + this.owner.xOffset;
        y += (offset.y * this.owner.height) + this.owner.yOffset;

        let zIndex = this.owner.zIndex;
        offset.behind ? zIndex-- : zIndex++;

        const projectileID = this.world.spriteLayer.add(
            new Pellets(this,this.world,this.owner,x,y,()=>{
                world.spriteLayer.remove(projectileID);
            }),zIndex
        );
    };

    const enableBoomSound = () => shouldPlayBoomEffect = true;

    const playBlastSound = () => {
        shouldPlayBoomEffect = false;
        world.playSound("ShotgunBlast");
        setTimeout(enableBoomSound,BOOM_TIMEOUT);
    };

    const shotgunHUD = new ShotgunHUD(world);

    const {inventory} = world;

    const hasBullets = () => {
        return inventory.has("shells");
    };
    const takeBullet = () => {
        inventory.take("shells");
        shotgunHUD.update();
    };

    let playEmptySound = true;

    const shotgunEmpty = forTermination => {
        if(!playEmptySound) return;
        playEmptySound = false;
        world.playSound("ShotgunEmpty");
        if(!forTermination) {
            setTimeout(()=>playEmptySound = true,EMPTY_SOUND_TIMEOUT);
        }
    };

    const queueReload = fastTrack => {
        if(!hasBullets()) {
            if(!fastTrack) {
                firing = true;
                setTimeout(()=>{
                    firing = false;
                },FIRE_TIMEOUT);
            }
            return;
        }
        firing = true;
        const callback = async ()=>{
            lastReloadTime = performance.now();
            await world.playSound("ShotgunReload");
            firing = false;
        };
        if(fastTrack) {
            callback();
        } else {
            setTimeout(callback,FIRE_TIMEOUT);
        }
    };

    this.attack = () => {
        if(firing) return;
        if(!hasBullets()) {
            shotgunEmpty(false);
            return;
        }
        playEmptySound = true;
        lastFireTime = performance.now();
        playBlastSound();
        shoot();
        takeBullet();
        queueReload(false);
    };

    this.load = () => {
        shotgunHUD.add();
        queueReload(true);
    };
    this.unload = () => {
        shotgunHUD.delete();
        shotgunEmpty(true);
    };
}

Object.defineProperty(Shotgun,"name",{value:NAME,enumerable:true});

export default Shotgun;
