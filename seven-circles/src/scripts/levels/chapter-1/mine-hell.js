import {DarkRoom,ObjectiveText,MapNuke,GetLastTrigger,GetNextTrigger, SaveStone} from "../helper.js";
import RadarLamp from "../../../weapons/radar-lamp.js";

const BOMB_TRIGGER_ID = 15;

function MineHell({world,fromNextMap,failureCount=0,grabbedWepLastTime=false}) {
    world.setMap("c1-mine");
    const objective = new ObjectiveText(world);
    if(fromNextMap) {
        world.addPlayer(62,7.5,"left");
    } else {
        world.addPlayer(6,22,"up");
    }
    const {player} = world;
    world.camera.padding = true;
    DarkRoom(world);

    const bombLocations = new Array();
    const {tileRenderer} = world;
    tileRenderer.readLayer(4).forEach((value,idx) => {
        if(value !== BOMB_TRIGGER_ID) return;
        const pos = tileRenderer.getXY(idx);
        pos[0] += 0.5, pos[1] += 0.5;
        bombLocations.push(pos);
    });

    let grabbedWep = false;

    const pickupLamp = async (x,y) => {
        world.setInteractionTile(x,y,0);
        world.setCollisionTile(x,y,0);
        world.pushTileChanges();
        if(failureCount === 0) {
            await world.sayNamed("You came to me for help? You must be desperate.","Mysterious Lamp","r");
        }
        world.setForegroundTile(x,y,0);
        player.setWeapon(RadarLamp,bombLocations);
        grabbedWep = true;
    };

    const trippedABomb = () => MapNuke(world,objective,{failureCount:failureCount+1,grabbedWepLastTime:grabbedWep});

    const saveStone = new SaveStone(world,8,16);

    this.interact = data => {
        if(saveStone.tryInteract(data)) return;
        const {value,x,y} = data;
        if(value === 16) pickupLamp(x,y);
    };

    if(failureCount === 1 && !grabbedWepLastTime) this.start = () => {
        if(!fromNextMap) {
            objective.set("Look out for landmines!","boom");
        }
        (async () => {
            await delay(500);
            await world.sayNamed("Hey, idiot. You're in a minefield. If only someone here had a sixth sense.","Mysterious Lamp","r");
            world.playerController.unlock();
        })();
        return true;
    }

    world.setTriggers([
        GetLastTrigger(world,1,"down"),
        GetNextTrigger(world,2,"right",null,objective.close),
        [BOMB_TRIGGER_ID,trippedABomb,true]
    ]);
}
export default MineHell;
