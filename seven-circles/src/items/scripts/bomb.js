import BombWeapon from "../../weapons/bomb-weapon.js";

function Bomb() {
    this.retain = true;
    this.action = ({player,script,world}) => {
        if(script.noWeapons) return false;

        const currentWeapon = player.getWeapon();
        if(currentWeapon) {
            if(currentWeapon.name === BombWeapon.name) {
                player.clearWeapon();
                return true;
            }
        }

        return player.setWeapon(BombWeapon,script,world);
    };
}
export default Bomb;
