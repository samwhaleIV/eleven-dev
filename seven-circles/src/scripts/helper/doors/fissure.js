function Fissure(world,interactionID,toPrevious=false) {

    const interact = async () => {
        if(world.inventory.has("fissure-token")) {
            if(await world.prompt(
                "Do you want to use your fissure token?",
                ["Yes, get me out of here!","No. I want to stay here forever."]
            ) === 0) {
                world.inventory.take("fissure-token",1);
                const paramters = [null,1000];
                if(toPrevious) {
                    world.transitionLast();
                } else {
                    world.transitionNext();
                }
            }
        } else {
            world.message("A fissure token is required to travel through this fissure.");
        }
    };

    this.tryInteract = ({value}) => {
        if(value === interactionID) {
            interact();
            return true;
        } else {
            return false;
        }
    };
}
export default Fissure;
