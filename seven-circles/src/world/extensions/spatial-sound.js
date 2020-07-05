const {AudioManager} = Eleven;

const BASE_SCALE = 7;
const PAN_DISTANCE = 4;
const MUTE_DISTANCE = 12;

const HIGH_SCALE_DELINEATION = 2;
const LOW_SCALE_DELINEATION = 4;

const MISSING_SOUND = name => {
    console.warn(`Cannot play sound '${name}'. It was not loaded or is not in the sound effects table.`);
};

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

function dataPreprocess(data) {
    if(typeof data === "string") data = {name:data};
    const {name,volume} = data;
    if(name) {
        data.buffer = this.soundEffects[name];
        if(buffer === null) return null;
        if(!buffer) {
            if(buffer !== null) MISSING_SOUND(name);
            return null;
        }
    }
    if(isNaN(volume)) data.volume = 1;
    return data;
};

async function playSpatialSound(data) {
    data = dataPreprocess(data); if(!data) return;

    data.usePanning = true;
    let {target,x,y,volume} = data;
    const useTarget = Boolean(target);

    if(useTarget) {
        if(isNaN(x)) x = target.x; if(isNaN(y)) y = target.y;
    }
    if(isNaN(x)) x = this.camera.x; if(isNaN(y)) y = this.camera.y;

    const remoteControl = AudioManager.playSound(data);

    let updater;
    if(useTarget) {
        updater = sendTrackedPositionUpdate.bind(this,remoteControl,target,volume);
    } else {
        updater = sendPositionUpdate.bind(this,remoteControl,x,y,volume);
    }

    const updaterID = this.dispatchRenderer.addFinalize(updater);
    updater();

    await remoteControl.waitForEnd();
    this.dispatchRenderer.removeFinalize(updaterID);
}

function playControlledSound(data) {
    data = dataPreprocess(data); if(!data) return;
    data.usePanning = false;
    const remoteControl = AudioManager.playSound(data);
    return remoteControl;
}

function playSound(data) {
    const remoteControl = playControlledSound.call(this,data);
    return remoteControl.waitForEnd();
}

export default {playSound,playControlledSound,playSpatialSound};
