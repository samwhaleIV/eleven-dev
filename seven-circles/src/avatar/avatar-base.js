const {AnimatedSprite, MultiLayer, CollisionTypes} = Eleven;

function GetAvatarBase(world,x,y,image,...parameters) {
    const sprite = new AnimatedSprite(image,x,y,...parameters);

    sprite.world = world;
    sprite.collisionType = CollisionTypes.Avatar;
    sprite.collides = true;

    let basicRender = true, basicUpdate = true;

    const renderLayer = new MultiLayer();
    const updateLayer = new MultiLayer();

    const renderBase = sprite.render;
    renderLayer.add(renderBase);

    sprite.addRender = (layer,priority) => {
        basicRender = false;
        return renderLayer.add(layer,priority);
    };
    sprite.removeRender = renderLayer.remove;

    sprite.addUpdate = (layer,priority) => {
        basicUpdate = false;
        return updateLayer.add(layer,priority);
    };
    sprite.removeUpdate = updateLayer.remove;

    sprite.render = (context,x,y,width,height,time) => {
        if(basicRender) {
            renderBase(context,x,y,width,height,time);
        } else {
            renderLayer.forEach(layer => {
                layer(context,x,y,width,height,time)
            });
        }
    };
    sprite.update = time => {
        if(!basicUpdate) updateLayer.forEach(layer => {
            layer(time);
        });
    }

    return sprite;
}

export default GetAvatarBase;
