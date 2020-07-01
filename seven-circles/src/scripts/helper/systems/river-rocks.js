import PickupRock from "../../../weapons/pickup-rock.js";

const WATER_ROCK_SPOT_ID = 32;
const ROCK_FOREGROUND_ID = 533;
const PICKUP_ROCK_ID = 48;
const TOP_CLIP_ID = 25;

function RiverRocks(world,script) {
    const {tileRenderer, player} = world;
    const waterPlacements = {}, pickupRockLocations = {};

    const badRock = () => world.message("A rock can't go here!");

    const tryCreateHeadspace = (x,y) => {
        if(world.getCollisionTile(x-1,y-1) === 1) {
            world.setCollisionTile(x-1,y-1,TOP_CLIP_ID); //Top left
        }
        if(world.getCollisionTile(x,y-1) === 1) {
            world.setCollisionTile(x,y-1,TOP_CLIP_ID); //Top center
        }
        if(world.getCollisionTile(x+1,y-1) === 1) {
            world.setCollisionTile(x+1,y-1,TOP_CLIP_ID); //Top right
        }
    };

    script.placeRock = () => {
        const result = world.playerImpulse.impulse({tileHandler:data=>{
            const {x,y,value} = data;
            if(value === WATER_ROCK_SPOT_ID) {
                player.unlockWeapon(); player.clearWeapon();
                world.setCollisionTile(x,y,0);
                world.setForegroundTile(x,y,ROCK_FOREGROUND_ID);
                world.setInteractionTile(x,y,0);
                tryCreateHeadspace(x,y);
                world.pushTileChanges();
                return true;    
            }
            return false;
        }});
        if(!result) badRock();
    };

    tileRenderer.readLayer(4).forEach((value,idx)=>{
        if(value === WATER_ROCK_SPOT_ID) {
            const [x,y] = tileRenderer.getXY(idx);
            waterPlacements[`${x},${y}`] = true;
            if(world.getCollisionTile(x,y) < 1) {
                world.setCollisionTile(x,y,1);
            }
        } else if(value === PICKUP_ROCK_ID) {
            const [x,y] = tileRenderer.getXY(idx);
            pickupRockLocations[`${x},${y}`] = true;
            world.setCollisionTile(x,y,1);
        }
    });
    tileRenderer.readLayer(1).forEach((value,idx)=>{
        if(value !== ROCK_FOREGROUND_ID) return;
        const [x,y] = tileRenderer.getXY(idx);
        tryCreateHeadspace(x,y);
    });

    this.tryPickup = data => {
        if(data.value === PICKUP_ROCK_ID) {
            const playerWep = player.getWeapon();
            if(playerWep && playerWep.name === "rock-pickup") {
                world.message("You're weak. You can only carry one rock at a time.");
            } else {
                const {x,y} = data;
                const pos = `${x},${y}`;
                delete pickupRockLocations[pos];
    
                world.setForegroundTile(x,y,0);
                world.setCollisionTile(x,y,0);
                world.setInteractionTile(x,y,0);
                world.pushTileChanges();
    
                player.setWeapon(PickupRock,script);
                player.lockWeapon();
            }
            return true;
        }
        return false;
    }
}
export default RiverRocks;
