function AnimationPlayer({
    frameWidth,frameHeight,
    rowOffset=0,columnOffset=0,
    frameTime=100,
    horizontal=false,imageName
}) {
    const image = Eleven.ResourceManager.getImage(imageName);

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

    this.render = (context,x,y,width,height,{now}) => {
        let row = this.rowOffset, column = this.columnOffset;

        if(paused) now = pauseStart;
        now += pauseTimeOffset;

        const frameNumber = Math.floor(now / this.frameTime);

        if(this.horizontal) column += frameNumber; else row += frameNumber;

        row = row % this.rows, column = column % this.columns;

        context.drawImage(
            image,column*frameWidth,row*frameHeight,frameWidth,frameHeight,
            x,y,width,height
        );
    };
}
export default AnimationPlayer;
