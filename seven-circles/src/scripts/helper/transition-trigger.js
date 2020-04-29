import FadeTransition from "./fade-transition.js";

const directions = {
    up: 0, right: 1, down: 2, left: 3
};

function GetTransitionTrigger(
    world,ID,scriptName,direction,scriptData,fadeTime
) {
    const player = world.player;
    const targetDirection = directions[direction];
    const hasDirection = targetDirection !== undefined;
    return [
        ID,hasDirection ? () => {
            if(player.direction !== targetDirection) return "repeat";
            FadeTransition(world,scriptName,scriptData,fadeTime);
        }:FadeTransition.bind(null,world,scriptName,scriptData,fadeTime),!hasDirection
    ];
}
export default GetTransitionTrigger;
