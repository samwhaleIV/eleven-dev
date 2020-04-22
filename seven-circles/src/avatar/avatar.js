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

    if(this.isPlayer) {
        InstallHitBox(this,10/16,14/16);
        this.yOffset = -(2 / 16);
        this.alignment = Alignments.Friendly;
        this.velocity = PLAYER_VELOCITY;
        this.showHitBox = false;
    } else {
        NPCController.call(this);
        InstallHitBox(this,12/16,14/16);
        this.yOffset = 0;
        this.alignment = Alignments.Neutral;
        this.velocity = NPC_VELOCITY;
    }

}

export default Avatar;

