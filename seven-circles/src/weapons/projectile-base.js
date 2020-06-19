import Alignments from "../avatar/alignments.js";

const PROJECTILE_MAX_DISTANCE = 20;
const DEFAULT_VELOCITY = 13;
const FALLBACK_SIZE = 0.2;

const {CollisionTypes} = Eleven;

const MISSING_TARGET = () => {
    throw Error("Projectile base must be installed onto its derivative. Did you forget the target value?");
};
const MISSING_WORLD = () => {
    throw Error("Without a world, the projectile cannot be collision checked. Did you forget the world value?");
};
const MISSING_TERMINATE = () => {
    throw Error("Without a terminator, the projectile will run indefinitely. A terminator is required!");
};

const defaultRender = function(context,x,y,width,height) {
    x = Math.floor(x); y = Math.floor(y);
    context.fillStyle = this.color;
    context.fillRect(x,y,width,height);
}

function ProjectileBase({
    target, world, owner, width, height, render,
    color, x, y, terminate, onCollision, velocity, maxDistance
}) {
    const ownerAlignment = owner.alignment || Alignments.Neutral;
    if(!maxDistance) maxDistance = PROJECTILE_MAX_DISTANCE;

    if(!target) MISSING_TARGET();

    if(!world) MISSING_WORLD();

    if(!terminate) MISSING_TERMINATE();

    target.render = render || defaultRender.bind(target);

    if(isNaN(width)) width = FALLBACK_SIZE;
    if(isNaN(height)) height = FALLBACK_SIZE;
    if(isNaN(velocity)) velocity = DEFAULT_VELOCITY;

    const captureVelocity = owner.moving ? owner.velocity : 0;

    target.collisionType = CollisionTypes.Projectile;
    target.owner = owner;
    target.color = color ? color : ownerAlignment.color;

    target.x = x; target.y = y;
    target.width = width; target.height = height;

    target.x -= target.width / 2;
    target.y -= target.height / 2;

    target.velocity = velocity + captureVelocity;
    target.direction = owner.direction;

    let movementDistance = 0;

    const handleCollision = collisionResult => {
        if(collisionResult.isHitBox) collisionResult = collisionResult.target;

        const targetAlignment = collisionResult.alignment || Alignments.Neutral;
        if(!ownerAlignment.canAttack[targetAlignment.ID]) return;

        if(onCollision) onCollision(collisionResult);
        if(collisionResult.onProjectile) collisionResult.onProjectile(target);

        terminate();
    };

    target.update = ({deltaSecond}) => {

        const delta = target.velocity * deltaSecond;

        switch(target.direction) {
            case 0: target.y -= delta; break;
            case 1: target.x += delta; break;
            case 2: target.y += delta; break;
            case 3: target.x -= delta; break;
        }

        movementDistance += delta;

        if(Math.abs(movementDistance) > maxDistance) {
            terminate(); return;
        }

        let collisionResult = world.collisionLayer.collides(target);
        if(!collisionResult) collisionResult = world.tileCollision.collides(target);
        if(collisionResult) handleCollision(collisionResult);
    };
}

export default ProjectileBase;
