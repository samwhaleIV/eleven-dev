import {AddPalaceFloor,KeyDoor,SaveStone,HellGate,MakePlayerBig,MakePlayerSmall,ObjectiveText} from "../helper.js";

function AlicePalace({world,inventory,fromNextMap}) {
    world.setMap("alice-palace");
    world.camera.verticalPadding = true;
    AddPalaceFloor(world);

    const objective = new ObjectiveText(world);

    if(!fromNextMap) {
        world.addPlayer(8.545,2.9375,"down",{lowSpeed:true});
    } else {
        world.addPlayer(8.545,49.9375,"down",{lowSpeed:true});
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
        startGate.close();
        return false;
    };

    this.endGate = endGate;

    const tooSmallTooRideThisRide = () => {
        world.message("You're too small to pick up the key!");
    };

    const clearTileLocation = (x,y) => {
        world.setForegroundTile(x,y,0);
        world.setCollisionTile(x,y,0);
        world.setInteractionTile(x,y,0);
    };

    const eatSmallMushroom = (x,y) => {
        world.setForegroundTile(x,y,1444);
        world.setInteractionTile(x,y,0);
        world.pushInteractionChanges();
        MakePlayerSmall(world);
    };

    const valueResponseTable = {
        21: eatSmallMushroom,
        19: (x,y) => {
            if(world.player.scale < 1) {
                tooSmallTooRideThisRide();
                return;
            }
            clearTileLocation(x,y);
            world.pushTileChanges();
            inventory.give("white-key");
        },
        20: (x,y) => {
            world.setForegroundTile(x,y,1445);
            world.setInteractionTile(x,y,0);
            world.pushInteractionChanges();
            MakePlayerBig(world);
        },
        16: () => {
            world.setInteractionTile(13,34,0);
            world.setInteractionTile(14,34,0);
            world.setInteractionTile(13,35,0);
            world.setInteractionTile(14,35,0);
            world.pushInteractionChanges();
            inventory.give("cleaver");
            world.setForegroundTile(13,34,1443);
            world.playSound("CleaverMushroom");
        },
        17: x => {
            if(!inventory.has("cleaver")) {
                world.message("The mushroom is too thick to break with your hands!");
                return;
            }
            world.setInteractionTile(8,34,0);
            world.setInteractionTile(9,34,0);
            world.setInteractionTile(8,35,0);
            world.setInteractionTile(9,35,0);

            if(x === 8) {
                world.setForegroundTile(8,34,1507)
            } else {
                world.setForegroundTile(9,34,1315)
            }

            world.pushInteractionChanges();
            world.playSound("CleaverMushroom");
            inventory.take("cleaver",1);
            MakePlayerBig(world);
        },
        18: () => {
            if(world.player.scale <= 1) {
                tooSmallTooRideThisRide();
                return;
            }
            [[4,34],[5,34]].forEach(([x,y])=>{
                clearTileLocation(x,y);
            });
            world.pushTileChanges();
            inventory.give("ice-key");
        },
        22: eatSmallMushroom,
        25: (x,y) => {
            if(endGate.isOpen) {
                world.message("This is a button that can only be pressed once.");
                return;
            }
            world.playSound("ButtonClick");
            world.setForegroundTile(x,y,1254);
            endGate.open();
            world.message("The nearby portal gate was activated!");
            objective.set("Travel through the portal gate!");
        }
    };

    this.keyDoorOpened = door => {
        const weapon = world.player.getWeapon();
        if(weapon && weapon.name === "key-weapon") {
            if(door.color !== weapon.color) return;
            world.player.clearWeapon();
            inventory.clear(`${weapon.color}-key`);
        }
    };

    this.interact = data => {
        const {value,x,y} = data;
        if(value in valueResponseTable) {
            valueResponseTable[value](x,y);
            return;
        };
        if(startGate.tryInteract(data)) return;
        if(endGate.tryInteract(data)) return;
        if(keyDoors.tryInteract(data)) return;
        if(saveStone.tryInteract(data)) return;   
    };

}
export default AlicePalace;
