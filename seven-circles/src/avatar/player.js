import Avatar from "./avatar.js";
import Constants from "../constants.js";
import GetAvatarBase from "./avatar-base.js";

const {ResourceManager} = Eleven;

const PLAYER_SPRITE = Constants.PlayerSprite;

function GetPlayerSprite(x,y,...parameters) {
    if(!x) x = 0; if(!y) y = 0;

    const playerImage = ResourceManager.getImage(PLAYER_SPRITE);

    const player = GetAvatarBase(this,x,y,playerImage);

    Avatar.call(player,true,...parameters);
    
    return player;
}

export default GetPlayerSprite;
