const Player = {
    width: 1, height: 1,

    files: `{"Image": ["player/default"]}`,
    defaults: {x:0,y:0,direction:"down"},
    sprite: null,

    save: ({self}) => {
        const {x,y,direction} = self.sprite;
        return {x,y,direction};
    },

    create: ({isEditor,world,self,files},data) => {
        const {x,y,direction} = data;

        let sprite;
        if(!isEditor) {
            sprite = world.addPlayer(x,y);
        } else {
            sprite = world.addNPC(
                x,y,files.getImage("player/default")
            );
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
