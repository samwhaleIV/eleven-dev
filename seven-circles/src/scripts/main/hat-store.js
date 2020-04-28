import AddColorBackground from "../helper/color-background.js";

const parentMap = "HatHell";

function HatStore({world,transition}) {
    world.setMap("hat-store");
    AddColorBackground(world,"black");

    const player = world.addPlayer(3.5,8);
    player.direction = "up";

    this.interact = ({value}) => {
        if(value === 16) {
            transition(parentMap); return;
        }
    };
}
export default HatStore;
