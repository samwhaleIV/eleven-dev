import {AddColorBackground,ObjectiveText} from "../helper.js";

function TheBeginning({world}) {
    world.setMap("the-beginning");
    AddColorBackground(world,"#96DDFF");
    const player = world.addPlayer(8,12,"down");
    
    const objectiveText = new ObjectiveText(world);

    world.setTriggers([
        [1,()=>{
            objectiveText.set("Inspect the mysterious lamp.","inspect");
        },true]
    ]);

    let inputProxy = null;

    const lampInteract = async () => {
        objectiveText.close();
        world.playerController.lock();
        world.camera.zoomTo(100,10000);
        inputProxy = world.getInputProxy({cleanOnOpen:true});
        world.sayNamed("Oh. You really shouldn't have done that.","???","r");
        await delay(3000);
        world.transitionNext(null,500);
    };
    this.unload = () => {
        if(inputProxy) inputProxy.close();
    };

    this.interact = ({value}) => {
        if(value === 16) lampInteract();
    }
}
export default TheBeginning;
