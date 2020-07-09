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

async function SquareTest(megaDemonGuy) {
    let idx = 0;
    const spots = [[0,0],[1,0],[1,1],[0,1]];
    while(true) {
        let [x,y] = spots[idx];
        idx = (idx + 1) % spots.length;
        await megaDemonGuy.animateHandAsync({x,y,duration:500,left:true});
        console.log(megaDemonGuy.leftArm[2].x.toFixed(2),megaDemonGuy.leftArm[2].y.toFixed(2));
        await frameDelay(1000);
    }
}

function AngleDifferenceTest(world) {
    let i = 0;
    const data = [[],[]];

    world.dispatchRenderer.addUpdate((context,size,time)=>{
        switch(i++) {
            case 0:
                megaDemonGuy.leftArm[0].angle = Math.PI * Math.random();
                megaDemonGuy.leftArm[1].angle = Math.PI * Math.random();
                data[0] = [
                    megaDemonGuy.leftArm[0].angle,
                    megaDemonGuy.leftArm[1].angle
                ];
                //Set rotations
                break;
            case 1:
                data[1] = [
                    megaDemonGuy.leftArm[2].x,
                    megaDemonGuy.leftArm[2].y
                ];
                //Record position
                break;
            case 2:
                megaDemonGuy.setHand(true,data[1][0],data[1][1]);
                //Set hand to recorded position through IK
                break;
            case 3:
                const angle1 = megaDemonGuy.leftArm[0].angle;
                const angle2 = megaDemonGuy.leftArm[1].angle;

                console.log(
                    "X Difference",((angle1-data[0][0])*180/Math.PI).toFixed(3),
                    "Y Difference",((angle2-data[0][1])*180/Math.PI).toFixed(3),
                );
                i = 0;
                //Measure and log angular difference
                break;
        }
    });
}

function IKTest({world}) {
    world.setMap("checkered");

    const megaDemonGuy = AddMegaDemonGuy(world,0,0,true,true);
    world.camera.x = 0, world.camera.y = 0;

    for(const bone of megaDemonGuy.leftArm) {
        console.log(bone.x,bone.y);
    }

    //megaDemonGuy.setHand(true,0,0);

    /* [197,343] correct(ish) angle for [0,0] */

    globalThis.setJoint = (a,b) => {
        megaDemonGuy.leftArm[0].angle = a, megaDemonGuy.leftArm[1].angle = b;
    };
    globalThis.getJoint = () => {
        return [megaDemonGuy.leftArm[0].angle*180/Math.PI,megaDemonGuy.leftArm[1].angle*180/Math.PI];
    }

    AddColorBackground(world,"white");
}
export default IKTest;
