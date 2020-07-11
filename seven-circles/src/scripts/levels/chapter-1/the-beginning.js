import {AddColorBackground,ObjectiveText} from "../helper.js";

function TheBeginning({world}) {
    world.setMap("c1-beginning");
    AddColorBackground(world,"#96DDFF");
    world.addPlayer(8,12,"down");
    
    const objective = new ObjectiveText(world);

    world.setTriggers([[1,()=>{
        objective.set("Inspect the mysterious lamp.","inspect");
    },true]]);

    const lampInteract = async () => {
        objective.close();
        world.playerController.lock();
        world.camera.zoomTo(100,10000);
        world.disableInput();
        world.sayNamed("Oh. You really shouldn't have done that.","???","r");
        await delay(3000);
        world.transitionNext(null,500);
    };

    this.interact = ({value}) => {
        if(value === 16) lampInteract();
    }
}
export default TheBeginning;
