function KeyDoorHandler(world,doors) {
    return type => {
        world.playerImpulse.impulse({tileHandler:data=>{
            const {value} = data;
            let matchedAnyDoor = false;
            for(let i = 0;i<doors.length;i++) {
                const door = doors[i];

                const matchesDoor = value === door.interactionValue;
                if(matchesDoor) matchedAnyDoor = true;

                if(type !== door.color) continue;

                if(matchesDoor) {
                    door.open(); return true;
                }
            }
            if(matchedAnyDoor) {
                world.playerController.lock();
                (async () => {
                    world.playerController.lock();
                    await world.showMessageInstant(`A ${type} key doesn't work here!`);
                    world.playerController.unlock();
                })();
                return true;
            }
            return false;
        }});
    };
}
export default KeyDoorHandler;
