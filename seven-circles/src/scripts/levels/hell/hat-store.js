import {AddNamedBackground} from "../helper.js";

const PARENT_MAP = "HatHell";

function HatStore({world,transition}) {
    world.setMap("hat-store");
    AddNamedBackground(world,"hell");

    const player = world.addPlayer(3.5,8);
    player.direction = "up";

    this.interact = ({value}) => {
        if(value === 16) {
            transition(PARENT_MAP); return;
        }
    };
}
export default HatStore;
