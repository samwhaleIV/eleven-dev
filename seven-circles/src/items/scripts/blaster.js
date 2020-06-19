import GenericBlaster from "../../weapons/generic-blaster.js";
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

        return player.setWeapon(GenericBlaster);
    };
}
export default Blaster;
