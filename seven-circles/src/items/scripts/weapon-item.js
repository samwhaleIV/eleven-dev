function GetWeaponItem(weaponObject) {
    const weaponPrototype = function() {
        this.retain = true;
        this.action = ({player,script}) => {
            if(script.noWeapons) return false;
    
            const currentWeapon = player.getWeapon();
            if(currentWeapon) {
                if(currentWeapon.name === weaponObject.name) {
                    player.clearWeapon();
                    return true;
                }
            }
    
            return player.setWeapon(weaponObject);
        };
    };
    Object.defineProperty(weaponPrototype,"name",{value:weaponObject.name});
    return weaponPrototype;
}
export default GetWeaponItem;

