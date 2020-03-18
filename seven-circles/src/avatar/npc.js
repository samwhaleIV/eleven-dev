import Avatar from "./avatar.js";
import GetAvatarBase from "./avatar-base.js";

function GetNPCSprite(x,y,image,...parameters) {
    const npc = GetAvatarBase(this,x,y,image);
    Avatar.call(npc,false,...parameters);
    return npc;
}

export default GetNPCSprite;
