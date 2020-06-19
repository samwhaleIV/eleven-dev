const MISSING_IMAGE = () => {
    throw Error("Animation player does not have a suitable image!");
};

function AnimationPlayer({
    frameWidth=16,frameHeight=16,
    rowOffset=0,columnOffset=0,
    frameTime=100,looping=true,
    horizontal=false,imageName,image
}) {
    if(imageName) image = Eleven.ResourceManager.getImage(imageName);
    if(!image) MISSING_IMAGE();

    this.rowOffset = rowOffset;
    this.columnOffset = columnOffset;
    this.frameTime = frameTime;
    this.horizontal = horizontal;

    this.rows = image.height / frameHeight;
    this.columns = image.width / frameWidth;

    let pauseTimeOffset = 0;
    let paused = false;
    let pauseStart = null;

    const resume = () => {
        if(!paused) return;
        pauseTimeOffset -= performance.now() - pauseStart;
        pauseStart = null;
        paused = false;
    };
    const pause = () => {
        if(paused) return;
        pauseStart = performance.now();
        paused = true;
    };

    this.pause = pause; this.resume = resume;
    Object.defineProperty(this,"paused",{
        get: () => paused,
        set: value => {
            if(value) pause(); else resume();
        },
        enumerable: true
    });

    let startTime = looping ? null : performance.now();
    this.render = (context,x,y,width,height,{now}) => {
        if(startTime) now -= startTime;

        let row = this.rowOffset, column = this.columnOffset;

        if(paused) now = pauseStart;
        now += pauseTimeOffset;

        const frameNumber = Math.floor(now / this.frameTime);

        if(this.horizontal) {
            column += frameNumber;
            if(!looping && column >= this.columns) return;
        } else {
            row += frameNumber;
            if(!looping && row >= this.rows) return;
        }

        row = row % this.rows, column = column % this.columns;

        context.drawImage(
            image,column*frameWidth,row*frameHeight,frameWidth,frameHeight,
            x,y,width,height
        );
    };
}
export default AnimationPlayer;
