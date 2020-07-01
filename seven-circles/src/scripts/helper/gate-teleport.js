import PlayerSizeLoop from "./player-size-loop.js";

const {ParticleSystem} = Eleven;

const BlinkEffect = ParticleSystem.getType("Jitter",{
    duration: 500,
    size: 20,
    color: "#F3B6C7",
    count: 13,
    minJiter: 0.8,
    maxJitter: 1.2,
    x: 15,
    y: 25,
    xv: 200,
    yv: 200,
});

function GateTeleport(world,callback) {
    world.spriteFollower.disable();
    world.playerController.lock();
    world.inputDisabled = true;

    const target = world.player;

    const emitter = ParticleSystem.getEmitter(BlinkEffect);
    const particles = world.addParticles(
        target.camX+target.width/2,target.camY,emitter
    );

    (async () => {
        await Promise.all([
            new Promise(resolve => emitter.fire(()=>{
                world.removeParticles(particles);
                resolve();
            })),
            PlayerSizeLoop(world,0),
            delay(1000)
        ]);
        callback();
    })();
}
export default GateTeleport;
