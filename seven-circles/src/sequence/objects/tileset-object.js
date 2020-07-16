import Shorthand from "./shorthand.js";

function TileSprite(
    x,y,objectWidth,objectHeight,texture,
    textureX,textureY,textureWidth,textureHeight
) {
    this.x = x, this.y = y;

    this.width = objectWidth, this.height = objectHeight;

    this.roundRenderLocation = true;

    this.render = (context,x,y,width,height) => {
        context.drawImage(texture,textureX,textureY,textureWidth,textureHeight,x,y,width,height);
    };
}

const GetThumbnailGenerator = (tilesetX,tilesetY) => {
    return ({context,tileset}) => {
        context.drawImage(tileset,tilesetX,tilesetY,16,16,0,0,16,16);
    };
};

const GetTilesetObject = (
    tilesetX,tilesetY,width,height,hasCollision
) => {
    const baseSize = 16;
    const objectWidth = width / baseSize, objectHeight = height / baseSize;

    const thumbnailGenerator = GetThumbnailGenerator(tilesetX,tilesetY);

    return {
        width: objectWidth, height: objectHeight,

        defaults: `{"x":0,"y":0}`,
    
        thumbnail: thumbnailGenerator,
    
        sprite: null,
    
        create: ({self,tileset},data) => {
            const {x,y} = data;
    
            const sprite = new TileSprite(
                x,y,self.width,self.height,
                tileset,textureX,textureY,width,height
            );
            if(hasCollision) {
                sprite.collides = true;
            }

            self.sprite = sprite;
        },
    
        delete: ({world,self}) => {
            world.spriteLayer.remove(self.sprite.ID);
        },
    
        properties: {
            x: Shorthand.XProp, y: Shorthand.YProp
        }
    };
};
export default GetTilesetObject;
export {TileSprite,GetTilesetObject,GetThumbnailGenerator};
