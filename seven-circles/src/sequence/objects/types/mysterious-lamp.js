import {TileSprite,GetThumbnailGenerator} from "../tileset-object.js";
import Shorthand from "../shorthand.js";

const textureX = 96, textureY = 16;

const MysteriousLamp = {
    width: 1, height: 1,

    defaults: `{"x":0,"y":0,"message":""}`,
    thumbnail: GetThumbnailGenerator(textureX,textureY),

    sprite: null,
    create: ({world,self,tileset},data) => {
        const {x,y,message} = data;

        const sprite = new TileSprite(
            x,y,1,1,tileset,textureX,textureY,16,16
        );
        sprite.message = message;
        sprite.collides = true;
        sprite.interact = () => {
            const {message} = sprite;
            if(typeof message === "string" && message.length) {
                world.sayNamed(message,"Mysterious Lamp","r");
            }
        };
        self.sprite = sprite;
        world.spriteLayer.add(sprite);
    },
    delete: Shorthand.SpriteDeleter,
    properties: {
        x: Shorthand.XProp,
        y: Shorthand.YProp,
        message: {
            get: ({self}) => {
                return self.sprite.message;
            },
            set: ({self},value) => {
                self.sprite.message = value
            }
        }
    }
};
export default MysteriousLamp;
