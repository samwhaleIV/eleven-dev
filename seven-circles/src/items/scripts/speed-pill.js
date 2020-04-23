import PillParticles from "./pill-particles.js";

const {ResourceManager, AudioManager} = Eleven;

const SPEED_MODIFIER = 2;
const SPEED_EFFECT = PillParticles.Speed;

const SPLASH_RATE = 200;

const SPEED_PILL_FLAG = "speedPillActive";

function SpeedPill() {
    this.action = ({world,script,player}) => {
        if(player[SPEED_PILL_FLAG]) {
            return false;
        }
        player[SPEED_PILL_FLAG] = true;

        player.oldVelocity = player.velocity;
        player.velocity *= SPEED_MODIFIER;

        const sound = ResourceManager.getAudio("grow");
        AudioManager.play(sound);

        player.texture = ResourceManager.getImage("player-fast");

        (async () => {
            while(world.script === script) {
                PillParticles.Emit(world,player,SPEED_EFFECT,true,3,0.75);
                await frameDelay(SPLASH_RATE);
            }
        })();
    
        return true;
    };
}
export default SpeedPill;
