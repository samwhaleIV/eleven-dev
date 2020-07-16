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
    hasCollision = Boolean(hasCollision);

    const baseSize = 16;
    const objectWidth = width / baseSize, objectHeight = height / baseSize;

    const thumbnailGenerator = GetThumbnailGenerator(tilesetX,tilesetY);

    return {
        width: objectWidth, height: objectHeight,
        defaults: Shorthand.XYDefaults,
        thumbnail: thumbnailGenerator,
        create: ({self,tileset},data) => {
            const {x,y} = data;
    
            const sprite = new TileSprite(
                x,y,self.width,self.height,
                tileset,textureX,textureY,width,height
            );

            sprite.collides = hasCollision;

            self.sprite = sprite;
        },
        delete: Shorthand.SpriteDeleter,
        properties: Shorthand.XYProp
    };
};
export default GetTilesetObject;
export {TileSprite,GetTilesetObject,GetThumbnailGenerator};
