import ZIndexBook from "../z-indices.js";
import ParticleSprite from "../particle-sprite.js";

function addParticlesBase(x,y,emitter,target,size,useLowSpriteLayer) {
    useLowSpriteLayer = Boolean(useLowSpriteLayer);
    const particleSprite = new ParticleSprite(
        x,y,emitter,target,this,size
    );
    const zIndex = ZIndexBook[useLowSpriteLayer ? "ParticleSpriteLow" : "ParticleSprite"];
    const ID = (useLowSpriteLayer ? this.spriteLayer : this.highSpriteLayer).add(
        particleSprite,zIndex
    );
    particleSprite.ID = ID;
    particleSprite.lowSpriteLayer = useLowSpriteLayer;
    return particleSprite;
}
function addParticles(x,y,emitter,size,useLowSpriteLayer) {
    return addParticlesBase.call(this,x,y,emitter,null,size,useLowSpriteLayer);
}
function addTrackedParticles(target,emitter,size,useLowSpriteLayer) {
    return addParticlesBase.call(this,null,null,emitter,target,size,useLowSpriteLayer);
}
function removeParticles(particleSprite) {
    (particleSprite.lowSpriteLayer ? this.spriteLayer : this.highSpriteLayer).remove(particleSprite.ID);
}
export default {addParticles,addTrackedParticles,removeParticles};
