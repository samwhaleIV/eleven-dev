import Shorthand from "../shorthand.js";

const Player = {
    width: 1, height: 1,
    files: `{"Image": ["player/default"]}`,
    defaults: `{"x":0,"y":0,"direction":2,"fromNext":false}`,
    thumbnail: "player/default",

    create: ({isEditor,world,self,files},data) => {
        const {x,y,direction,fromNext} = data;

        let sprite;
        if(!isEditor) {
            const {fromNextMap} = world.scriptData;
            if(Boolean(fromNextMap) === Boolean(fromNext)) {
                sprite = world.addPlayer(x,y);
            } else {
                return;
            }
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
        direction: Shorthand.DirectionProp,
        fromNext: Shorthand.GetBoolProp(
            "fromNext","From Next Level"
        )
    }
};
export default Player;
