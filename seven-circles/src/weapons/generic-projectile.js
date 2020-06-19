import DecayEffect from "./decay-effect.js";
import ProjectileBase from "./projectile-base.js";

function GenericProjectile(
    world,owner,x,y,terminate
) {
    const onCollision = (collisionResult,hitBox) => {
        let {x,y} = this;

        switch(this.direction) {
            case 1: x = hitBox.x + hitBox.width * (1 / 5); break;
            case 3: x = hitBox.x + hitBox.width * (3 / 5); break;
        }

        x += this.width / 2; y += this.height / 2;

        let effectID;
        const zIndex = collisionResult.zIndex + 1;

        const terminate = () => world.spriteLayer.remove(effectID);

        effectID = world.spriteLayer.add(
            new DecayEffect(x,y,terminate),zIndex
        );
    };

    let width = 0.2, height = 0.2;

    switch(owner.direction) {
        case 2: case 0: width /= 2; break;
        case 1: case 3: height /= 2; break;
    }

    ProjectileBase({
        target: this,
        world, owner, x, y, terminate,
        width, height, onCollision
    });
}

export default GenericProjectile;
