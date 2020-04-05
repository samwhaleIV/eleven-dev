const RENDER_BOX_SIZE = 2;

function ParticleSprite(x,y,emitter,target,size) {
    if(isNaN(size)) size = RENDER_BOX_SIZE;

    const halfSize = size / 2;

    this.width = size, this.height = size;

    this.xOffset = 0; this.yOffset = 0;

    if(target) {
        this.update = () => {
            let {x,y,xOffset,yOffset} = target;

            if(xOffset) x += xOffset; if(yOffset) y += yOffset;

            x += target.width / 2, y += target.height / 2;

            this.x = x - halfSize, this.y = y - halfSize;
        };
        this.update();
    } else {
        this.x = x - halfSize, this.y = y - halfSize;
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
