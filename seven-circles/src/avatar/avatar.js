import WeaponHandler from "./weapon-handler.js";
import NPCController from "./npc-controller.js";

const {CollisionTypes, InstallHitBox} = Eleven;

function Avatar(isPlayer,...parameters) {
    WeaponHandler.call(this);

    this.collisionType = isPlayer ? CollisionTypes.Player : CollisionTypes.Enemy;

    this.isPlayer = isPlayer;

    if(this.isPlayer) {
        InstallHitBox(this,12/16,12/16);
        this.yOffset = -(2 / 16);
    } else {
        NPCController.call(this);
        InstallHitBox(this,12/16,14/16);
        this.yOffset = 0;
    }

}

export default Avatar;

