import {AddPalaceFloor,KeyDoor,SaveStone,HellGate} from "../helper.js";

function AlicePalace({world,inventory,fromNextMap}) {
    world.setMap("alice-palace");
    world.camera.verticalPadding = true;
    AddPalaceFloor(world);

    if(!fromNextMap) {
        world.addPlayer(8.545,2.9375,"down");
    } else {
        world.addPlayer(8.545,49.9375,"down");
    }

    world.player.hitBox.width = 0.8;

    this.unload = () => {
        inventory.clear("ice-key");
        inventory.clear("white-key");
    };
    this.unload();

    const keyDoors = KeyDoor.getDoors(
        world,this,[[8,29,"horizontalWhite"],[6,38,"jumboIce"]]
    );
    const saveStone = new SaveStone(world,10,6);

    const startGate = new HellGate(world,8,0,true,0,()=>{
        world.transitionLast();
    });
    const endGate = new HellGate(world,8,55,false,1,()=>{
        world.transitionNext();
    });

    this.start = () => {
        if(startGate.open) {
            (async () => {
                if(startGate.open) startGate.close();
                world.playerController.unlock();
            })();
            return true;
        }
        return false;
    };

    this.interact = data => {
        if(startGate.tryInteract(data)) return;
        if(endGate.tryInteract(data)) return;
        if(keyDoors.tryInteract(data)) {
            const weapon = world.player.getWeapon();
            if(weapon && weapon.name === "key-weapon") {
                world.player.clearWeapon();
                inventory.clear(`${weapon.color}-key`);
            }
            return;
        }
        if(saveStone.tryInteract(data)) return;
        const {value,x,y} = data;
    };

}
export default AlicePalace;
