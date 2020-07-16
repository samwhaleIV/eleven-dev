const Placeholder = {
    width: 1, height: 1,

    defaults: `{"x":0,"y":0,"color":"blue","square":true}`,
    sprite: null,

    thumbnail: "editor/blue-square",

    create: ({world,self},data) => {
        const {x,y,color,square} = data;

        const sprite = new (function(x,y) {
            this.x = x, this.y = y;

            this.width = self.width;
            this.height = self.height;

            this.color = color;
            this.collides = true;
            this.square = square;

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
        })(x,y);

        world.spriteLayer.add(sprite);

        self.sprite = sprite;
    },

    delete: ({world,self}) => {
        world.spriteLayer.remove(self.sprite.ID);
    },

    properties: {
        x: {
            get: ({self}) => {
                return self.sprite.x;
            },
            set: ({self},value) => {
                self.sprite.x = value;
            },
        },
        y: {
            get: ({self}) => {
                return self.sprite.y;
            },
            set: ({self},value) => {
                self.sprite.y = value;
            }
        },
        color: {
            get: ({self}) => {
                return self.sprite.color
            },
            set: ({self},value) => {
                self.sprite.color = value;
            }
        },
        square: {
            name: "Square",
            get: ({self}) => {
                return self.sprite.square;
            },
            set: ({self},value) => {
                self.sprite.square = value;
            }
        }
    }
};
export default Placeholder;

