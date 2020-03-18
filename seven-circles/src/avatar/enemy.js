import Avatar from "./avatar.js";
import GetAvatarBase from "./avatar-base.js";

const {CollisionTypes} = Eleven;

function GetEnemySprite(x,y,image,...parameters) {
    const enemy = GetAvatarBase(
        this,x,y,CollisionTypes.Enemy,image
    );
    Avatar.call(enemy,false,...parameters);
    return enemy;
}

export default GetEnemySprite;
