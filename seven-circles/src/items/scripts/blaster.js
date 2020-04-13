import GenericBlaster from "../../weapons/generic-blaster.js";
const IMAGE_NAME = "player-gun";

function Blaster() {
    this.retain = true;
    this.action = ({player,script}) => {
        if(script.noWeapons) return false;

        const currentWeapon = player.getWeapon();
        if(currentWeapon) {
            if(currentWeapon.name === GenericBlaster.name) {
                player.clearWeapon();
                return true;
            }
        }

        const image = Eleven.ResourceManager.getImage(IMAGE_NAME);

        return player.setWeapon(GenericBlaster,image);
    };
}
export default Blaster;
