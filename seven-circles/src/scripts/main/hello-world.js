import Lifetime from "../helper/lifetime.js";

const BACKGROUND_COLOR = `rgb(20,0,0)`;

const START_POSITION = {x:7,y:24.5,direction:0};

function HelloWorld(world,data) {

    const {
        resumePosition,
        setPosition,
        storePosition,save
    } = Lifetime;

    world.setMap("hell");
    const player = world.addPlayer();

    resumePosition(player,START_POSITION);

    world.addTextSprite({
        world: world,
        text: "They can go anywhere!\n(And support multiple lines)",
        color: "white",
        x: player.x + 0.5, y: player.y + 0.5,
    });
    
    world.addTextSprite({
        world: world,
        text: "The world can now have text sprites!",
        followTarget: player,
        color: "white",
        y: -0.7,
        backgroundPadding: 2,
        backgroundColor: "black"
    });

    world.dispatchRenderer.addBackground((context,{width,height})=>{
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0,0,width,height);
    });

    const {ParticleSystem} = Eleven;

    const colors = ["red","orange","yellow","green","cyan","blue","purple"];
    let colorIndex = 0;

    this.emit = () => {
        const pool = ParticleSystem.getEmitterPool(ParticleSystem.getType(
            "Gravity",()=>{
                const color = colors[colorIndex];
                colorIndex = (colorIndex + 1) % colors.length;
                return color;
            }
        ),colors.length);

        const ID = world.dispatchRenderer.addRender((context,size,time)=>{
            pool.render(context,size.halfWidth,size.halfHeight,time);
        });

        const duration = 300;

        pool.stream(duration,duration/colors.length);
    };

    this.emit();
}
export default HelloWorld;
