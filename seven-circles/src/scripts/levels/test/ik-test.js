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
    const spots = [[1,1],[3,1],[3,3],[1,3]];
    while(true) {
        let [x,y] = spots[idx];
        idx = (idx + 1) % spots.length;
        await Promise.all([
            megaDemonGuy.animateHandAsync({x,y,duration:750,left:false}),
            megaDemonGuy.animateHandAsync({x,y,duration:750,left:true})
        ]);
        console.log(megaDemonGuy.rightHand.x.toFixed(2),megaDemonGuy.rightHand.y.toFixed(2));
        await frameDelay(500);
    }
}

function AngleDifferenceTest(world,megaDemonGuy) {
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

function MouseTrackTest(world,bone) {
    const {pointer} = Eleven.CanvasManager;

    const getAngle = (x1,y1,x2,y2) => {
        const dx = x1 - x2, dy = y1 - y2;

        let angle = Math.atan2(-dy,-dx);
        if(angle < 0) angle += Math.PI * 2;
    
        return angle;
    };

    world.dispatchRenderer.addUpdate(()=>{

        let {x,y} = world.grid.getLocation(bone.x,bone.y);

        const angle = getAngle(x,y,pointer.x,pointer.y);

        bone.angle = angle;
    });
}

function IKTest({world}) {
    world.setMap("checkered");

    const megaDemonGuy = AddMegaDemonGuy(world,0,0,true,true);
    world.camera.x = -0.5, world.camera.y = 0.75;

    for(const bone of megaDemonGuy.leftArm) {
        console.log(bone.x,bone.y);
    }

    //megaDemonGuy.leftArm[0].angle = Math.PI / 2;

    /* [197,343] correct(ish) angle for [0,0] */

    //megaDemonGuy.leftArm[0].selfAngle = Math.PI / 4;
    //megaDemonGuy.leftArm[1].selfAngle = Math.PI / 4;

    //SquareTest(megaDemonGuy);

    globalThis.setJoint = (a,b) => {
        megaDemonGuy.leftArm[0].angle = a, megaDemonGuy.leftArm[1].angle = b;
    };
    globalThis.getJoint = () => {
        return [megaDemonGuy.leftArm[0].angle*180/Math.PI,megaDemonGuy.leftArm[1].angle*180/Math.PI];
    };

    world.dispatchRenderer.addRender(()=>{
        const {x,y} = Eleven.CanvasManager.pointer;
        const tileLocation = world.grid.getTileLocation(x,y);
        tileLocation.y += 0.5;
        //megaDemonGuy.setHand(true,tileLocation.x,tileLocation.y);
        megaDemonGuy.setHand(false,tileLocation.x,tileLocation.y);
       // console.log(megaDemonGuy.leftHand.x,megaDemonGuy.leftHand.y);
    });

    //MouseTrackTest(world,megaDemonGuy.leftArm[0]);
    
    //SquareTest(megaDemonGuy);
    megaDemonGuy.leftHand.bindAngle = true;
    megaDemonGuy.rightHand.bindAngle = true;

    AddColorBackground(world,"white");
}
export default IKTest;
