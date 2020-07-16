import Shorthand from "../shorthand.js";

function PlaceholderSprite(world,x,y,color,square) {
    this.x = x, this.y = y;
    this.width = 1, this.height = 1;

    this.color = color, this.collides = true ,this.square = square;

    this.roundRenderLocation = true;

    this.interact = () => {
        world.message(`I am a placeholder ${this.square ? "square" : "circle"}!`);
    };

    this.render = (context,x,y,width,height) => {
        context.fillStyle = this.color;
        if(this.square) {
            context.fillRect(x,y,width,height);
        } else {
            context.beginPath();
            context.arc(x+width/2,y+height/2,width/2,0,Math.PI*2);
            context.fill();
        }
    };
}

const Placeholder = {
    width: 1, height: 1,

    defaults: `{"x":0,"y":0,"color":"blue","square":true}`,
    sprite: null,

    thumbnail: "editor/blue-square",

    create: ({world,self},data) => {
        const {x,y,color,square} = data;

        const sprite = new PlaceholderSprite(
            world,x,y,color,square
        );

        world.spriteLayer.add(sprite);

        self.sprite = sprite;
    },

    delete: Shorthand.SpriteDeleter,

    properties: {
        x: Shorthand.XProp,
        y: Shorthand.YProp,
        color: Shorthand.ColorProp,
        square: Shorthand.GetBoolProp("square")
    }
};
export default Placeholder;

