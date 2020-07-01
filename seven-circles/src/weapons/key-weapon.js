const NAME = "key-weapon";

const colorTable = {
    red: 0,
    blue: 1,
    yellow: 2,
    green: 3,
    pink: 4,
    chocolate: 5,
    white: 6,
    ice: 7
};

function KeyWeapon(type,script) {

    const textureY = (colorTable[type] || 0) * 16;
    this.color = type;

    const image = Eleven.ResourceManager.getImage("weapon/keys");

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
