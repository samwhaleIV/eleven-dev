function BlueprintFragment() {
    this.retain = false;
    this.action = ({script,world}) => {
        if(world.playerController && world.playerController.locked) {
            world.playerController.unlock();
        }
        return world.playerImpulse.impulse({tileHandler:data=>{
            if(!script.tryUseBlueprintFragment(data.value)) {
                world.message(`The blueprint fragment won't do anything here!`);
            }
            return true;
        }});
    };
}
export default BlueprintFragment;

