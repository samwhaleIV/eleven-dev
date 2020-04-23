const {ParticleSystem} = Eleven;

const PARTICLE_DURATION = 500;
const PARTICLE_COUNT = 10;

const PARTICLE_VELOCITY = 80;
const PARTICLE_SIZE = 9;

const particleBase = ParticleSystem.getType("Base",{
    duration: PARTICLE_DURATION,
    size: PARTICLE_SIZE,
    count: PARTICLE_COUNT,
    xv: PARTICLE_VELOCITY,
    yv: PARTICLE_VELOCITY
});

const getEffect = color => {
    const effect = Object.assign(new Object(),particleBase);
    effect.color = color;
    return effect;
};

const growEffect = getEffect("#3AFFFF");
const shrinkEffect = getEffect("#FFA03A");
const speedEffect = getEffect("#FF1E1E");

const emit = (world,player,effect,belowSprite,scale,yOffset=0.5) => {
    const effectScale = scale ? scale : player.scale || 1;
    effect.size = PARTICLE_SIZE * effectScale;

    const emitter = ParticleSystem.getEmitter(effect);

    const particleSprite = world.addParticles(
        player.x + player.width / 2,
        player.y + player.height * yOffset,
        emitter,null,belowSprite
    );

    emitter.fire(()=>{
        world.removeParticles(particleSprite);
    });
};

const PillParticles = Object.freeze({
    Grow: growEffect,
    Shrink: shrinkEffect,
    Speed: speedEffect,
    Emit: emit
});

export default PillParticles;
