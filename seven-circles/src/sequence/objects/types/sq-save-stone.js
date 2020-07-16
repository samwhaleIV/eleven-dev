import {GetThumbnailGenerator, TileSprite} from "../tileset-object.js";
import Shorthand from "../shorthand.js";
import SaveStone from "../../../scripts/helper/interactables/save-stone.js";

const TEXTURE_X = 224, TEXTURE_Y = 0;

const SQSaveStone = {
    thumbnail: GetThumbnailGenerator(TEXTURE_X,TEXTURE_Y),
    defaults: Shorthand.XYDefaults,

    create: ({world,self,tileset,isEditor},data) => {
        const {x,y} = data;
        const sprite = new TileSprite(
            x,y,1,1,tileset,TEXTURE_X,TEXTURE_Y,16,16
        );
        sprite.collides = true;
        self.sprite = sprite;
        world.spriteLayer.add(sprite);

        if(!isEditor) {
            const saveStone = new SaveStone(world);
            sprite.interact = saveStone.interact;
        }
    },

    delete: Shorthand.SpriteDeleter,

    properties: Shorthand.XYProp
};

export default SQSaveStone;

