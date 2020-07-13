const Placeholder = {
    width: 1, height: 1,

    defaults: {x:0,y:0},
    sprite: null,

    save: ({self}) => {
        const {x,y} = self.sprite;
        return {x,y};
    },

    create: ({world,self},data) => {
        const {x,y} = data;

        const sprite = new (function(x,y) {
            this.x = x, this.y = y;
            this.width = self.width, this.height = self.height;
            this.collides = true;
            this.interact = () => {
                world.message("I am a placeholder square!");
            };
            this.render = (context,x,y,width,height) => {
                context.fillStyle = "blue";
                context.fillRect(x,y,width,height);
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
            }
        },
        y: {
            get: ({self}) => {
                return self.sprite.y;
            },
            set: ({self},value) => {
                self.sprite.y = value;
            }
        }
    }
};
export default Placeholder;

