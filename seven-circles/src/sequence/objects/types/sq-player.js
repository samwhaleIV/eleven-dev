import Shorthand from "../shorthand.js";

const Player = {
    width: 1, height: 1,
    files: `{"Image": ["player/default"]}`,
    defaults: `{"x":0,"y":0,"direction":2}`,
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

    delete: Shorthand.SpriteDeleter,

    properties: {
        x: Shorthand.XProp, y: Shorthand.YProp,
        direction: Shorthand.DirectionProp
    }
};
export default Player;
