const Player = {
    width: 1, height: 1,

    files: `{"Image": ["player/default"]}`,
    defaults: `{"x":0,"y":0,"direction":"down"}`,
    sprite: null,

    thumbnail: "player/default",

    create: ({isEditor,world,self,files},data) => {
        const {x,y,direction} = data;

        let sprite;
        if(!isEditor) {
            sprite = world.addPlayer(x,y);
        } else {
            sprite = new Eleven.AnimatedSprite(
                files.getImage("player/default"),x,y
            );
            world.spriteLayer.add(sprite);
        }
        sprite.direction = direction;
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
        },
        direction: {
            get: ({self}) => {
                return self.sprite.direction;
            },
            set: ({self},value) => {
                self.sprite.direction = value;
            }
        }
    }
};
export default Player;
