import Avatar from "./avatar.js";
import Constants from "../constants.js";
import GetAvatarBase from "./avatar-base.js";

const {ResourceManager} = Eleven;

const PLAYER_SPRITE = Constants.PlayerSprite;

function GetPlayerSprite(x,y,direction,data={}) {
    if(isNaN(x)) x = 0; if(isNaN(y)) y = 0;

    const playerHat = SVCC.Runtime.SaveState.get("player-hat");
    const imageName = playerHat ? `player/${playerHat}` : PLAYER_SPRITE;

    const playerImage = ResourceManager.getImage(imageName);
    const player = GetAvatarBase(this,x,y,playerImage);
    if(direction !== undefined) player.direction = direction;

    Avatar.call(player,true,data.lowSpeed);
    return player;
}

export default GetPlayerSprite;
