import ZIndexBook from "../z-indices.js";
import ParticleSprite from "../particle-sprite.js";

function addParticlesBase(x,y,emitter,target,size) {
    const particleSprite = new ParticleSprite(
        x,y,emitter,target,this,size
    );
    const ID = this.highSpriteLayer.add(
        particleSprite,ZIndexBook.ParticleSprite
    );
    particleSprite.ID = ID; return particleSprite;
}
function addParticles(x,y,emitter,size) {
    return addParticlesBase.call(this,x,y,emitter,null,size);
}
function addTrackedParticles(target,emitter,size) {
    return addParticlesBase.call(this,null,null,emitter,target,size);
}
function removeParticles(particleSprite) {
    const ID = typeof particleSprite === "number" ? particleSprite : particleSprite.ID;
    this.highSpriteLayer.remove(ID);
}
export default {addParticles,addTrackedParticles,removeParticles};
