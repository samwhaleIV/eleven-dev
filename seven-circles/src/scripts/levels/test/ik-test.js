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
    world.camera.x = 0, world.camera.y = 1.5;


    world.dispatchRenderer.addUpdate((context,size,time) => {
        const {leftArm,rightArm} = megaDemonGuy;

        const angle = (time.now / 500) * Math.PI;

        leftArm[0].angle = angle / 2;
        leftArm[1].angle = angle;

        rightArm[0].angle = angle + Math.PI;
        rightArm[1].angle = angle / 2 + Math.PI;

        megaDemonGuy.angle = angle / 4;
    });

    AddColorBackground(world,"white");
}
export default IKTest;
