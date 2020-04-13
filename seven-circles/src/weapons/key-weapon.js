const NAME = "key-weapon";

const colorTable = {
    red: 0,
    blue: 16,
    yellow: 32,
    green: 48,
    pink: 64,
    chocolate: 80
};

function KeyWeapon(type,script) {

    const textureY = colorTable[type] || 0;
    this.color = type;

    const image = Eleven.ResourceManager.getImage("player-keys");

    this.name = NAME;

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;
        const textureX = directionMatrix[direction];
        context.drawImage(
            image,textureX,textureY,16,16,x,y,width,height
        );
    };

    this.attack = () => {
        if(script.useKey) script.useKey(type);
    };

}

Object.defineProperty(KeyWeapon,"name",{value:NAME,enumerable:true});

export default KeyWeapon;
