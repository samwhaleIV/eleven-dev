const CanvasManager = Eleven.CanvasManager;
const Frame = Eleven.Frame;

function TestFrame() {
    this.keyDown = event => {
        console.log("Key down:",event);
    };
    this.keyUp = event => {
        //console.log("Key up  :",event);
    };
    this.load = () => {
        return new Promise(resolve=>setTimeout(resolve,2000));
    };
    this.resize = ({context}) => {
        context.fillStyle = "red";
    };
    this.render = (context,size) => {
        context.fillRect(0,0,size.width,size.height);
    }
}

CanvasManager.start({
    frame: Frame.create({
        base: TestFrame,
        gamepad: {
            binds: {
                Up: "TestUp",
                Down: "TestDown",
                Left: "TestLeft",
                Right: "TestRight",
            },
            compositeLeftAxis: true,
            compositeRightAxis: false
        }
    }),
    markLoaded: true
});
