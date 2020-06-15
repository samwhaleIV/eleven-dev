import Avatar from "./avatar.js";
import GetAvatarBase from "./avatar-base.js";

function GetNPCSprite(
    x,y,image,spriteScaleX,spriteScaleY
) {
    const npc = GetAvatarBase(
        this,x,y,image,spriteScaleX,spriteScaleY
    );
    Avatar.call(npc,false);
    return npc;
}

export default GetNPCSprite;
