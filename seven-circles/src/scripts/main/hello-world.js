import Lifetime from "../helper/lifetime.js";

const BACKGROUND_COLOR = `rgb(20,0,0)`;

const START_POSITION = {x:7,y:24.5,direction:0};

function HelloWorld(world) {

    const {resumePosition,storePosition,save} = Lifetime;

    world.setMap("hell");
    const player = world.addPlayer();

    resumePosition(player,START_POSITION);

    world.dispatchRenderer.addBackground((context,{width,height})=>{
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0,0,width,height);
    });
}
export default HelloWorld;
