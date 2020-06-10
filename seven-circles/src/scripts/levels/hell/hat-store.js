import {AddNamedBackground} from "../helper.js";

function HatStore({world,transitionLast}) {
    world.setMap("hat-store");
    AddNamedBackground(world,"hell");

    const player = world.addPlayer(3.5,8);
    player.direction = "up";

    this.interact = ({value}) => {
        if(value === 16) {
            transitionLast(); return;
        }
    };
}
export default HatStore;
