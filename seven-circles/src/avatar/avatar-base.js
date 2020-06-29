const {AnimatedSprite, MultiLayer, CollisionTypes} = Eleven;

function GetAvatarBase(world,x,y,image,...parameters) {
    const sprite = new AnimatedSprite(image,x,y,...parameters);

    sprite.world = world;
    sprite.collisionType = CollisionTypes.Avatar;
    sprite.collides = true;

    const renderLayer = new MultiLayer();
    const updateLayer = new MultiLayer();

    const renderBase = sprite.render;
    renderLayer.add(renderBase);

    sprite.addRender = renderLayer.add;
    sprite.addUpdate = updateLayer.add;

    sprite.removeRender = renderLayer.remove;
    sprite.removeUpdate = updateLayer.remove;

    sprite.render = (context,x,y,width,height,time) => {
        const layers = renderLayer.layers;
        for(let i = 0;i<layers.length;i++) {
            layers[i](context,x,y,width,height,time);
        }
    };

    sprite.update = time => {
        const layers = updateLayer.layers;
        for(let i = 0;i<layers.length;i++) {
            layers[i](time);
        }
    };

    return sprite;
}

export default GetAvatarBase;
