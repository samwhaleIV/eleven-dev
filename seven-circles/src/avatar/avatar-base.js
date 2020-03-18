import Constants from "../constants.js";

const {AnimatedSprite, MultiLayer, CollisionTypes} = Eleven;

const AVATAR_SPEED = Constants.AvatarSpeed;

function GetAvatarBase(world,x,y,collisionType,image) {
    const sprite = new AnimatedSprite(image,x,y);

    sprite.world = world;
    sprite.velocity = AVATAR_SPEED;

    sprite.collisionType = collisionType;
    sprite.collides = true;
    sprite.noCollide = {
        [CollisionTypes.PlayerProjectile]: true,
        [CollisionTypes.EnemyProjectile]: true
    };

    const updateLayer = new MultiLayer();
    const renderLayer = new MultiLayer();
    renderLayer.add(sprite.render);

    const boundAddition = function(multiLayer,layer,priority) {
        return multiLayer.add(layer.bind(this),priority);
    };

    sprite.addRender = boundAddition.bind(sprite,renderLayer);
    sprite.addUpdate = boundAddition.bind(sprite,updateLayer);

    sprite.removeRender = renderLayer.remove;
    sprite.removeUpdate = updateLayer.remove;

    sprite.render = (...data) => renderLayer.forEach(layer => layer(...data));
    sprite.update = (...data) => updateLayer.forEach(layer => layer(...data));

    return sprite;
}

export default GetAvatarBase;
