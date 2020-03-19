const {AudioManager} = Eleven;

const UPDATE_Z_INDEX = Infinity; //May need a lower Z index?

const BASE_SCALE = 7;
const PAN_DISTANCE = 4;
const MUTE_DISTANCE = 12;

const HIGH_SCALE_DELINEATION = 2;
const LOW_SCALE_DELINEATION = 4;

const minMax = (value,min,max) => {
    if(value <= min) {
        return min;
    } else if(value >= max) {
        return max;
    }
    return value;
};

function sendPositionUpdate(remoteControl,soundX,soundY) {

    let distanceScale = BASE_SCALE / this.camera.scale;

    if(distanceScale < 1) {
        distanceScale *= HIGH_SCALE_DELINEATION;
    } else if(distanceScale > 1) {
        distanceScale /= LOW_SCALE_DELINEATION;
    }

    const maxPanDistance = PAN_DISTANCE * distanceScale;
    const maxDistance = MUTE_DISTANCE * distanceScale;

    const xDif = soundX - this.camera.x;
    const yDif = soundY - this.camera.y;

    let distance = Math.hypot(xDif,yDif);

    distance = minMax(distance,0,maxDistance);
    distance = (maxDistance - distance) / maxDistance;

    const pan = minMax(xDif / maxPanDistance,-1,1);

    remoteControl.setPan(pan);
    remoteControl.setVolume(distance);
}

function InstallSpatialSound(target) {
    target.playSound = async function({
        buffer, volume, detune, x, y, loop, playbackRate
    }) {
        if(!x) x = this.camera.x; if(!y) y = this.camera.y;
    
        const remoteControl = AudioManager.playSound({
            buffer, volume, detune, loop, playbackRate, usePanning: true
        });
    
        const updater = sendPositionUpdate.bind(this,remoteControl,x,y);
        const updaterID = this.dispatchRenderer.addUpdate(updater,UPDATE_Z_INDEX);
    
        updater();
    
        await remoteControl.waitForEnd();
    
        this.dispatchRenderer.removeUpdate(updaterID);
    };
}
export default InstallSpatialSound;
