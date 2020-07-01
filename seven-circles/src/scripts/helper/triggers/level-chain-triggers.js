import GetTransitionTrigger from "./transition-trigger.js";

function GetNextTrigger(world,triggerID,triggerDirection,data) {
    const {nextMap} = world.scriptData;
    return GetTransitionTrigger(world,triggerID,nextMap,triggerDirection,data);
}
function GetLastTrigger(world,triggerID,triggerDirection,data) {
    const {lastMap} = world.scriptData;
    return GetTransitionTrigger(world,triggerID,lastMap,triggerDirection,data);
}

function InstallLevelChainTriggers(world,trigger1Direction,trigger2Direction) {
    world.setTriggers([
        GetLastTrigger(world,1,trigger1Direction),
        GetNextTrigger(world,2,trigger2Direction)
    ]);
}

function InstallLastTrigger(world,triggerDirection) {
    world.setTriggers([GetLastTrigger(world,1,triggerDirection)]);
}
function InstallNextTrigger(world,triggerDirection) {
    world.setTriggers([GetNextTrigger(world,1,triggerDirection)]);
}

export default InstallLevelChainTriggers;
export {
    InstallLastTrigger,InstallNextTrigger,InstallLevelChainTriggers,GetNextTrigger,GetLastTrigger
};
