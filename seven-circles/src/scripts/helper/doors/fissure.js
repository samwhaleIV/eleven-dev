function Fissure(world,interactionID,toPrevious=false) {

    const interact = async () => {
        if(world.inventory.has("fissure-token")) {
            if(await world.prompt(
                "Do you want to use your fissure token?",
                ["Yes, get me out of here!","No. I want to stay here forever."]
            ) === 0) {
                world.playSound("FissureTravel");
                const parameters = [null,2000];
                if(toPrevious) {
                    world.transitionLast(...parameters);
                } else {
                    world.transitionNext(...parameters);
                }
                world.inventory.take("fissure-token",1);
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
