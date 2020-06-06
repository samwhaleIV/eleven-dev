import GetPlayerSprite from "../../avatar/player.js";
import GetNPCSprite from "../../avatar/npc.js";
import GetInteractivePlayerController from "../world-player.js";

import ZIndexBook from "../z-indices.js";

const {CollisionTypes, TextSprite, TileSprite} = Eleven;

const summonSafetyBase = 16;

const safeSummonPosition = value => Math.round(value * summonSafetyBase) / summonSafetyBase;

function summonSprite(sprite) {
    const {direction, hitBox} = this.player;

    const extraDistance = 1 / 32;

    let x, y;

    switch(direction) {
        case 0: //up
        case 2: //down
            x = hitBox.x + hitBox.width / 2 - sprite.width / 2;
            if(direction === 0) {
                y = hitBox.y - sprite.height - extraDistance;
            } else {
                y = hitBox.y + hitBox.height + extraDistance;
            }
            break;
        case 1: //right
        case 3: //left
            y = hitBox.y + hitBox.height / 2 - sprite.height / 2;
            if(direction === 3) {
                x = hitBox.x - sprite.width - extraDistance;
            } else {
                x = hitBox.x + hitBox.width + extraDistance;
            }
            break;
    }

    sprite.x = safeSummonPosition(x);
    sprite.y = safeSummonPosition(y);

    const collides = this.collisionLayer.collides(sprite) || this.tileCollision.collides(sprite);
    if(collides) this.spriteLayer.remove(sprite.ID);

    return !collides;
}
function addTileSprite(x,y,tileID,collides) {
    const tileSize = this.grid.baseTileSize;
    const [textureColumn,textureRow] = this.getTextureXY(tileID,false);

    const tileSprite = new TileSprite(
        x,y,this.tileset,textureColumn,textureRow,tileSize
    );

    if(collides) {
        tileSprite.collides = true;
        tileSprite.collisionType = CollisionTypes.Default;
    }

    this.spriteLayer.add(tileSprite,ZIndexBook.TileSprite);
    return tileSprite;
}
function addCustomPlayer(sprite,...parameters) {
    if(typeof sprite === "function") {
        sprite = new sprite(...parameters);
    }
    this.spriteLayer.add(sprite,ZIndexBook.Player);
    this.playerController = GetInteractivePlayerController(this,sprite);
    this.player = sprite;
    return sprite;
}
function addPlayer(...parameters) {
    const sprite = GetPlayerSprite.apply(this,parameters);
    return this.addCustomPlayer(sprite);
}
function addNPC(...parameters) {
    const NPC = GetNPCSprite.apply(this,parameters);
    this.spriteLayer.add(NPC,ZIndexBook.NPC);
    return NPC;
}
function addTextSprite(data) {
    if(data.center) {
        if(!isNaN(data.x)) data.x += 0.5;
        if(!isNaN(data.y)) data.y += 0.5;
    }
    data.grid = this.grid;
    const textSprite = new TextSprite(data);
    this.highSpriteLayer.add(textSprite,ZIndexBook.TextSprite);
    return textSprite;
}
function addSprite(sprite,ZIndex) {
    return this.spriteLayer.add(sprite,ZIndex);
}
export default {addTextSprite, addSprite, addNPC, addPlayer, addCustomPlayer, addTileSprite, summonSprite};
