import {CheckerBoard,Fissure,HellGate,AddPalaceFloor} from "../helper.js";

function SuperCheckerPalace({world,fromNextMap,inventory}) {
    world.setMap("super-checker-palace");
    AddPalaceFloor(world);
    world.camera.padding = true;
    
    if(fromNextMap) {
        world.addPlayer(20,10,"down");
    } else {
        world.addPlayer(5.5,4,"down");
    }

    const fissure = new Fissure(world,17,false);
    const startGate = new HellGate(world,5,1,true,0,()=>{
        world.transitionLast();
    });
    this.start = () => {
        startGate.close();
        return false;
    };

    this.unload = () => {
        inventory.clear("bridge-piece");
    };
    this.unload();

    const checkerBoard = new CheckerBoard(world,7,5,16,10,null,()=>{
        inventory.give("bridge-piece",1);
    });

    const placeBridge = (x,y) => {
        world.setCollisionTile(x,y,0);
        world.setCollisionTile(x+1,y,0);

        world.setInteractionTile(x,y,0);
        world.setInteractionTile(x+1,y,0);

        world.setForegroundTile(x,y,202);
        world.setForegroundTile(x+1,y,203);

        world.pushTileChanges();
    };

    this.interact = data => {
        if(checkerBoard.tryInteract(data)) return;
        if(startGate.tryInteract(data)) return;
        if(fissure.tryInteract(data)) return;
        const {value,x,y} = data;
        if(value === 16) {
            if(!inventory.has("bridge-piece")) {
                world.say("It looks like you're going to need more bridge.");
                return;
            }
            inventory.take("bridge-piece",1);
            placeBridge(18,y);
        } else if(value === 18) {
            inventory.give("fissure-token",1);
            world.setForegroundTile(x,y,0);
            world.setInteractionTile(x,y,0);
            world.setCollisionTile(x,y,0);
            world.pushTileChanges();
        }

    };
}
export default SuperCheckerPalace;
