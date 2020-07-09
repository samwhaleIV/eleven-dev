import {AddColorBackground,AddMegaDemonGuy} from "../helper.js";

function Box({
    x,y,center=true,
    size=0.25,color="rgba(255,0,0,0.5)"
}) {
    this.width = size, this.height = size;
    this.x = x, this.y = y;

    if(center) this.x -= this.width / 2, this.y -= this.height / 2;

    this.render = (context,x,y,width,height) => {
        context.fillStyle = color;
        context.fillRect(x,y,width,height);
    };
}
Box.prototype.center = function() {
    this.x -= this.width / 2, this.y -= this.height / 2;
};

function IKTest({world}) {
    world.setMap("empty");

    const megaDemonGuy = AddMegaDemonGuy(world,0.5,0.5,true,true);
    world.camera.x = 0, world.camera.y = 0;

    const box = new Box({x:0,y:0});
    world.spriteLayer.add(box);

    megaDemonGuy.leftUpperArm.angle = Math.PI * 0.25;

    world.dispatchRenderer.addUpdate((context,size,time) => {
        megaDemonGuy.leftUpperArm.angle = Math.PI * (time.now / 1000);
        const [x,y] = megaDemonGuy.leftUpperArm.getJoint("Elbow").getPosition();
        box.x = x, box.y = y;
        box.center();
        //megaDemonGuy.angle = Math.PI * (time.now / 20000);
        //console.log(megaDemonGuy.rightHand.x,megaDemonGuy.rightHand.y);
    });

    //AddColorBackground(world,"white");
}
export default IKTest;
