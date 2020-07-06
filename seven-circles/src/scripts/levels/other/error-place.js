import { AddColorBackground } from "../helper.js";

function ErrorPlace({world}) {
    world.setMap("error-place");
    AddColorBackground(world,"black");
    const player = world.addPlayer(4,3.5,{lowSpeed:true});
    player.direction = "down";
    this.interact = ({value}) => {
        if(value === 16) {
            world.message("It's a heart.")
        } else if(value === 17) {
            world.message("It's a hell block.");
        } else if(value === 18) {
            world.message("It's a ghoul of sorts.");
        }
    }
    this.start = () => {
        (async ()=>{
            await world.message("Uh.. hey. You got lost along the way and ended up in super limbo. This isn't supposed to happen, so please find someone who can figure out why you ended up here!");
            world.playerController.unlock();
        })();
        return true;
    };
}
export default ErrorPlace;
