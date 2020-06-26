const NAME = "radar-lamp";
const MAX_BLEND_ALPHA = 167 / 255;

function RadarLamp(radarPoints) {

    //Remember to normalize the radar points to the center of their collision boxes! We don't do that here.

    const Ranges = {
        Red: [0,1.75],
        Green: [1.75,4]
    };

    const image = Eleven.ResourceManager.getImage("weapon/hell-lamp");
    this.name = NAME;

    this.radarValue = 0;
    const getRadarRow = () => this.radarValue < 0 ? 1 : 2;

    const inverseLerp = (t,[min,max]) => (t - min) / (max - min);
    const inRange = (value,[min,max]) => value >= min && value < max;
    const clamp = (value,min,max) => Math.min(Math.max(value,min),max);

    const setRadarToDistance = distance => {
        let value = 0;
        if(inRange(distance,Ranges.Red)) {
            value = inverseLerp(distance,Ranges.Red);
            value = 1 - clamp(value,0,1);
        } else {
            value = -inverseLerp(distance,Ranges.Green);
            value = clamp(value,-1,0);
        }
        this.radarValue = value;
    };

    if(radarPoints) this.update = () => {
        let nearestDistance = Infinity;
        const {hitBox} = this.owner;
        const sx = hitBox.x + hitBox.width / 2;
        const sy = hitBox.y + hitBox.height / 2;
        for(const [x,y] of radarPoints) {
            const distance = Math.hypot(sx-x,sy-y);
            if(distance < nearestDistance) nearestDistance = distance;
        }
        setRadarToDistance(nearestDistance);
    };

    this.load = () => this.owner.noFog = true;
    this.unload = () => this.owner.noFog = false;
    this.attack = () => this.world.playerImpulse.impulse();

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;
        const textureX = directionMatrix[direction];
        context.drawImage(image,textureX,0,16,16,x,y,width,height);

        const {radarValue} = this;
        if(radarValue === 0) return;
        context.globalAlpha = MAX_BLEND_ALPHA * Math.abs(radarValue);
        context.drawImage(image,textureX,getRadarRow()*16,16,16,x,y,width,height);
        context.globalAlpha = 1;
    };
}

Object.defineProperty(RadarLamp,"name",{value:NAME,enumerable:true});

export default RadarLamp;
