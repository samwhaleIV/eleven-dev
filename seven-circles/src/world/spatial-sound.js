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

function sendPositionUpdate(remoteControl,soundX,soundY,baseVolume) {
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
    remoteControl.setVolume(distance * baseVolume);
}

function sendTrackedPositionUpdate(remoteControl,target,baseVolume) {
    sendPositionUpdate.call(this,remoteControl,target.x,target.y,baseVolume);
}

function InstallSpatialSound(target) {
    target.playSound = async function({
        buffer, volume, detune, x, y, loop, playbackRate, target
    }) {
        if(isNaN(volume)) volume = 1;

        const useTarget = Boolean(target);

        if(useTarget) {
            if(isNaN(x)) x = target.x;
            if(isNaN(y)) y = target.y;
        }

        if(!x) x = this.camera.x; if(!y) y = this.camera.y;
    
        const remoteControl = AudioManager.playSound({
            buffer, detune, volume, loop, playbackRate, usePanning: true
        });

        let updater;
        if(useTarget) {
            updater = sendTrackedPositionUpdate.bind(this,remoteControl,target,volume);
        } else {
            updater = sendPositionUpdate.bind(this,remoteControl,x,y,volume);
        }
    
        const updaterID = this.dispatchRenderer.addUpdate(updater,UPDATE_Z_INDEX);
    
        updater();
    
        await remoteControl.waitForEnd();
    
        this.dispatchRenderer.removeUpdate(updaterID);
    };
}
export default InstallSpatialSound;
