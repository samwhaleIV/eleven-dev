import Alignments from "../../../avatar/alignments.js";

const {ResourceManager,ParticleSystem,AnimatedSprite} = Eleven;

const BloodParticles = ParticleSystem.getType("Gravity",{
    x: 40,
    y: 40,
    xv: 100,
    size: 30,
    color: "#ff0000",
    count: 12,
    duration: 250,
    rate: 0.025,
    gravity: 40,
    jitter: 200
});

function Addsprite(world,x,y,direction="down") {
    const image = ResourceManager.getImage("crawler");
    const sprite = world.addNPC(x,y,image);

    sprite.direction = direction;
    sprite.velocity = 2;
    sprite.alignment = Alignments.Hostile;

    const emitBlood = () => {
        const emitter = ParticleSystem.getEmitter(BloodParticles);
        const particles = world.addParticles(
            sprite.x + sprite.width / 2,
            sprite.y + sprite.height / 2,
            emitter
        );
        emitter.fire(()=>{
            world.removeParticles(particles);
        });
    };

    const installShortHitbox = target => {
        target.hitBox = {
            x: target.x + 0.125,
            y: target.y + 0.6,
            width: 0.75,
            height: 0.4
        };
    };

    const getDummyLegs = sourceSprite => {
        const dummySprite = new AnimatedSprite(image,sourceSprite.x,sourceSprite.y);
        dummySprite.subtexture = 4;
        dummySprite.direction = sourceSprite.direction;
        dummySprite.collides = true;
        installShortHitbox(dummySprite);
        return dummySprite;
    };

    sprite.squareLoop = async size => {
        const {controller} = sprite;
        while(true && sprite.alive) {
            await controller.move(-size,0);
            if(!sprite.alive) return;

            await controller.move(0,-size);
            if(!sprite.alive) return;

            await controller.move(size,0);
            if(!sprite.alive) return;

            await controller.move(0,size);
        }
    };

    sprite.alive = true;

    sprite.shot = () => {
        let newSubtexture = sprite.subtexture + 1;
        if(newSubtexture === 4) {
            world.spriteLayer.remove(sprite.ID);
            sprite.alive = false;
            sprite.shot = null;
            world.spriteLayer.add(getDummyLegs(sprite));
        }
        sprite.subtexture = newSubtexture;
        emitBlood();
    };

    return sprite;
}
export default Addsprite;
