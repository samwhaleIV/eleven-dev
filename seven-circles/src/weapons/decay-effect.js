const DECAY_DURATION = 35;
const DECAY_SIZE = 0.075;
const DECAY_COLOR = "orange";
const DECAY_OFFSET = 0.025;

function DecayEffect(x,y,terminate) {
    const duration = DECAY_DURATION;
    const start = performance.now();

    const decayDeviation = () => Math.random() * DECAY_OFFSET - DECAY_OFFSET / 2;

    this.x = x + decayDeviation();
    this.y = y + decayDeviation();

    this.width = DECAY_SIZE; this.height = 0;

    this.color = DECAY_COLOR;

    this.render = (context,x,y,width,height,time) => {
        let delta = (time.now - start) / duration;
        if(delta > 1) {
            terminate(); return;
        } else if(delta < 0) {
            delta = 0;
        }

        x = Math.floor(x); y = Math.floor(y);
        context.beginPath();
        context.arc(x,y,width - width * delta,Math.PI * 2,0);
        context.fillStyle = this.color;
        context.fill();
    };
}

export default DecayEffect;
