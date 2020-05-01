const impulse = ({world,self,inventory}) => {
    world.spriteLayer.remove(self.ID);
    inventory.give(self.pickupID);
};

function Pickup(tileID,pickupID) {
    this.tileID = tileID;
    this.spriteData = {
        impulse, pickupID
    };
}

export default Pickup;
