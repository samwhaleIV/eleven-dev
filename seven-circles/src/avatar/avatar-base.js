const {AnimatedSprite, MultiLayer, CollisionTypes} = Eleven;

function GetAvatarBase(world,x,y,image,...parameters) {
    const sprite = new AnimatedSprite(image,x,y,...parameters);

    sprite.world = world;
    sprite.collisionType = CollisionTypes.Avatar;
    sprite.collides = true;

    const updateLayer = new MultiLayer();
    const renderLayer = new MultiLayer();
    const renderBase = sprite.render;
    const renderBaseID = renderLayer.add(renderBase);

    const shiftRenderBase = () => {
        renderLayer.remove(renderBaseID);
        return renderBase;
    };

    const boundAddition = function(multiLayer,layer,priority) {
        return multiLayer.add(layer.bind(this),priority);
    };

    sprite.addRender = boundAddition.bind(sprite,renderLayer);
    sprite.addUpdate = boundAddition.bind(sprite,updateLayer);

    sprite.removeRender = renderLayer.remove;
    sprite.removeUpdate = updateLayer.remove;

    sprite.render = (...data) => renderLayer.forEach(layer => layer(...data));
    sprite.update = (...data) => updateLayer.forEach(layer => layer(...data));

    sprite.shiftRenderBase = shiftRenderBase;

    return sprite;
}

export default GetAvatarBase;
