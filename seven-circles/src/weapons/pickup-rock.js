const NAME = "rock-pickup";

function PickupRock(script) {

    const image = Eleven.ResourceManager.getImage("weapon/rock");

    this.name = NAME;

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;
        const textureX = directionMatrix[direction];
        context.drawImage(image,textureX,0,16,16,x,y,width,height);
    };

    this.attack = () => {
        if(script.placeRock) script.placeRock();
    };
}

Object.defineProperty(PickupRock,"name",{value:NAME,enumerable:true});

export default PickupRock;
