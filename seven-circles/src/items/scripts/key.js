import KeyWeapon from "../../weapons/key-weapon.js";

function Key(type) {
    this.retain = true;
    this.action = ({player,script}) => {
        if(script.noWeapons) return false;

        const currentWeapon = player.getWeapon();
        if(currentWeapon) {
            if(currentWeapon.name === KeyWeapon.name && currentWeapon.color === type) {
                player.clearWeapon();
                return true;
            }
        }

        player.setWeapon(KeyWeapon,type,script);

        return true;
    };
}
export default Key;
