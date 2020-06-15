import WeaponHandler from "./weapon-handler.js";
import NPCController from "./npc-controller.js";
import Alignments from "./alignments.js";
import Constants from "../constants.js";

const PLAYER_VELOCITY = Constants.PlayerSpeed;
const NPC_VELOCITY = Constants.NPCSpeed;

const {CollisionTypes, InstallHitBox} = Eleven;

function Avatar(isPlayer) {
    WeaponHandler.call(this);

    this.collisionType = CollisionTypes.Avatar;

    this.isPlayer = isPlayer;

    if(this.isPlayer) {
        InstallHitBox(this,5/8,7/8);
        this.yOffset = -(1 / 8);
        this.alignment = Alignments.Friendly;
        this.velocity = PLAYER_VELOCITY;
        this.showHitBox = false;
    } else {
        NPCController.call(this);
        InstallHitBox(this,6/8,7/8);
        this.yOffset = 0;
        this.alignment = Alignments.Neutral;
        this.velocity = NPC_VELOCITY;
    }

}

export default Avatar;

