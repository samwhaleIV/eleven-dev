function DoorBase(world,openTarget,closeTarget,startOpen) {
    let opened = Boolean(startOpen);

    let collisionUpdateDeferred = false;
    this.deferCollisionUpdate = () => {
        collisionUpdateDeferred = true;
    };

    const setState = (open,updateCollision,instant) => {
        if(open === opened) return false;
        const target = open ? openTarget : closeTarget;
        const didChange = target(Boolean(instant));

        const deferringCollision = collisionUpdateDeferred;
        collisionUpdateDeferred = false;

        if(!didChange) return false;
        if(!deferringCollision && updateCollision) {
            world.pushCollisionChanges();
        }
        opened = open;
        return true;
    };

    this.open = () => setState(true,true);
    this.close = () => setState(false,true);
    this.toggle = () => setState(!opened,true);

    Object.defineProperty(this,"opened",{
        get: () => opened,
        enumerable: true
    });

    opened = !opened; setState(!opened,false,true); //Sets the first state of the door
}

export default DoorBase;
