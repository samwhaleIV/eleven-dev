const NAME = "lantern";

function Lantern() {
    const image = Eleven.ResourceManager.getImage("weapon/lamp");

    this.name = NAME;

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;
        const textureX = directionMatrix[direction];
        context.drawImage(
            image,textureX,0,16,16,x,y,width,height
        );
    };

    this.load = () => this.owner.noFog = true;
    this.unload = () => this.owner.noFog = false;
    this.attack = () => this.world.playerImpulse.impulse();
}

Object.defineProperty(Lantern,"name",{value:NAME,enumerable:true});

export default Lantern;
