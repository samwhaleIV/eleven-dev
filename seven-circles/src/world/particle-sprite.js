const RENDER_BOX_SIZE = 2;
const EMITTER_BASE_SCALE = 7;

function ParticleSprite(x,y,emitter,target,world,size) {
    if(isNaN(size) && size !== null) size = RENDER_BOX_SIZE;

    const halfSize = size / 2;

    this.width = size, this.height = size;

    this.xOffset = 0; this.yOffset = 0;

    const updateEmitterScale = () => {
        emitter.scale = world.camera.scale / EMITTER_BASE_SCALE;
    };

    if(target) {
        const updatePosition = () => {
            let {x,y,xOffset,yOffset} = target;

            if(xOffset) x += xOffset; if(yOffset) y += yOffset;

            x += target.width / 2, y += target.height / 2;

            this.x = x - halfSize, this.y = y - halfSize;
        };
        updatePosition();
        this.update = () => {
            updatePosition();
            updateEmitterScale();
        };
    } else {
        this.x = x - halfSize, this.y = y - halfSize;
        this.update = updateEmitterScale;
    }

    this.render = (context,x,y,width,height,time) => {
        x += width / 2, y += height / 2;
        emitter.render(context,x,y,time);
    };
}

ParticleSprite.prototype.setOffset = function(x,y) {
    if(isNaN(x)) x = 0; if(isNaN(y)) y = 0;
    this.xOffset = x, this.yOffset = y;
    return this;
};

export default ParticleSprite;
