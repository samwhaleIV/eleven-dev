import WeaponHandler from "./weapon-handler.js";
import NPCController from "./npc-controller.js";
import Alignments from "./alignments.js";
import Constants from "../constants.js";

const PLAYER_VELOCITY = Constants.PlayerSpeed;
const NPC_VELOCITY = Constants.NPCSpeed;

const {CollisionTypes, InstallHitBox} = Eleven;

function Avatar(isPlayer,...parameters) {
    WeaponHandler.call(this);

    this.collisionType = CollisionTypes.Avatar;

    this.isPlayer = isPlayer;

    this.alignment = isPlayer ? Alignments.Friendly : Alignments.Neutral;

    this.velocity = isPlayer ? PLAYER_VELOCITY : NPC_VELOCITY;

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

