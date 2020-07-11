function MouseTest({world}) {
    world.setMap("empty");

    const getAngle = (x1,y1,x2,y2) => {
        const dx = x1 - x2, dy = y1 - y2;

        let angle = Math.atan2(-dy,-dx);
        if(angle < 0) angle += Math.PI * 2;
    
        return angle;
    };

    world.dispatchRenderer.addUpdate((context,size,time)=>{
        context.fillStyle = "black";
        context.fillRect(0,0,size.width,size.height);

        const {x,y} = Eleven.CanvasManager.pointer;

        context.fillStyle = "red";
        context.fillRect(x-5,y-5,10,10);

        const transform = context.getTransform();

        let angle = 0;

        angle = getAngle(size.halfWidth,size.halfHeight,x,y);
        //angle *= Math.PI / 180;

        //angle = (time.now / 1000) % (Math.PI * 2);
    
        //console.log(angle);

        console.log(angle * 180 / Math.PI);

        context.translate(size.halfWidth,size.halfHeight);
        context.rotate(angle);
        context.fillStyle = "white";
        context.fillRect(-5,-5,100,10);

        context.setTransform(transform);
    });
}
export default MouseTest;
