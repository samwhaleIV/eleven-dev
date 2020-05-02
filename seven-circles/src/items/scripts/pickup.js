const interact = ({world,self,inventory}) => {
    world.spriteLayer.remove(self.ID);
    inventory.give(self.pickupID);
};

function Pickup(tileID,pickupID) {
    this.tileID = tileID;
    this.spriteData = {
        interact, pickupID
    };
}

export default Pickup;
