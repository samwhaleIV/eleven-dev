const NAME = "watcher-beam";

function WatcherBeam() {
    const spriteSize = 32;
    const beamColor = "#FF0000";
    const image = Eleven.ResourceManager.getImage("weapon/watcher-beam");
    this.name = NAME;

    const beamDistance = 1.975;
    const smallDimension = 3;

    const beamHorizontalOffset1 = 12;
    const beamHorizontalOffset2 = 17;

    const beamVerticalOffset = 5;

    const LR_Beam = (context,x,y,pixelSize,width,_) => {
        const beamWidth = width * beamDistance, beamHeight = pixelSize * smallDimension;
        context.fillRect(x+width,y+pixelSize*beamVerticalOffset,beamWidth,beamHeight);
    };
    const RL_Beam = (context,x,y,pixelSize,width,_) => {
        const beamWidth = width * beamDistance, beamHeight = pixelSize * smallDimension;
        context.fillRect(x-beamWidth,y+pixelSize*beamVerticalOffset,beamWidth,beamHeight);
    };
    const UD_Beam = (context,x,y,pixelSize,_,height) => {
        const beamHeight = height * beamDistance, beamWidth = pixelSize * smallDimension;
        context.beginPath();
        const beamY = y+height
        context.rect(x+pixelSize*beamHorizontalOffset1,beamY,beamWidth,beamHeight);
        context.rect(x+pixelSize*beamHorizontalOffset2,beamY,beamWidth,beamHeight);
        context.fill();
    };
    const DU_Beam = (context,x,y,pixelSize,_,height) => {
        const beamHeight = height * beamDistance, beamWidth = pixelSize * smallDimension;
        context.beginPath();
        const beamY = y-beamHeight;
        context.rect(x+pixelSize*beamHorizontalOffset1,beamY,beamWidth,beamHeight);
        context.rect(x+pixelSize*beamHorizontalOffset2,beamY,beamWidth,beamHeight);
        context.fill();
    };
    const beamTable = [DU_Beam,LR_Beam,UD_Beam,RL_Beam];

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;
        const textureX = directionMatrix[direction];
        context.drawImage(image,textureX,0,spriteSize,spriteSize,x,y,width,height);

        const pixelSize = 0.03125 * width;
        context.fillStyle = beamColor;
        beamTable[direction](context,x,y,pixelSize,width,height);
    };
}

Object.defineProperty(WatcherBeam,"name",{value:NAME,enumerable:true});

export default WatcherBeam;
