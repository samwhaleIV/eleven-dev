const NAME = "bomb";

function BombWeapon(script,world) {
    const image = Eleven.ResourceManager.getImage("player-bomb");

    this.name = NAME;

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;
        const textureX = directionMatrix[direction];
        context.drawImage(image,textureX,0,16,16,x,y,width,height);
    };

    this.attack = () => {
        if(script.placeBomb) {
            script.placeBomb();
        } else {
            world.message("Bombs can't be used in this place. It's too dangerous.");
        }
    };
}

Object.defineProperty(BombWeapon,"name",{value:NAME,enumerable:true});

export default BombWeapon;
