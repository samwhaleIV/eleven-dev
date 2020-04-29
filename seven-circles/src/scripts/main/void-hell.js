import GetTransitionTrigger from "../helper/transition-trigger.js";
import MessageChain from "../helper/message-chain.js";
import GetSwitchDoors from "../helper/doors/switch-doors.js";

const previousMap = "RiverHell";
const nextMap = "TDB";

const {ResourceManager,UVTCReflection} = Eleven;

function VoidHell({world,lastScript}) {
    world.setMap("void-hell");
    const {dispatchRenderer,grid,spriteFollower} = world;

    const reflector = UVTCReflection.getScrollable(grid,null,null,-0.5);
    dispatchRenderer.addBackground(reflector.clear);
    dispatchRenderer.addResize(reflector.resize);
    dispatchRenderer.addFinalize(reflector.render);

    if(lastScript === nextMap) {
        const player = world.addPlayer(45,6);
        player.direction = "left";
    } else {
        const player = world.addPlayer(0,6.5);
        player.direction = "right";
    }

    const {player,camera,playerController} = world;

    const antiPlayer = world.addNPC(
        20,6.5,ResourceManager.getImage("anti-player")
    );
    antiPlayer.direction = "left";
    antiPlayer.velocity = 1.5;
    const NPCController = antiPlayer.controller;
    antiPlayer.interact = () => {
        world.say("We'll be in touch.");
    };

    antiPlayer.xOffset = world.player.xOffset || 0;
    antiPlayer.yOffset = world.player.yOffset || 0;

    if(DEV) globalThis.antiPlayer = antiPlayer;

    camera.horizontalPadding = true;

    const makeANewFriend = async () => {
        playerController.lock();

        await delay(1000);

        await world.say("Ah, yes, the prodigal daughter arrives.");

        await delay(1000);

        spriteFollower.disable();
        const startX = camera.x;
        const startY = camera.y;

        const startScale = camera.scale;

        await Promise.all([
            camera.moveTo(
                antiPlayer.x+antiPlayer.xOffset,
                antiPlayer.y+antiPlayer.yOffset,
                1000
            ),
            camera.zoomTo(startScale+4,1000)
        ]);
        spriteFollower.target = antiPlayer;
        spriteFollower.enable();

        await delay(1000);
        antiPlayer.direction = "down";
        await delay(1000);
        await world.say("You have no idea how lucky you are.")
        await delay(500);
        antiPlayer.direction = "left";
        await delay(500);

        await NPCController.move(-2.75);

        await delay(1000);

        await MessageChain(world,[
            "How dare you.",
            "Who do you think you are?",
            "Do you think you're brave?",
            "Do you think you're smart?",
            "Strong?", "Clever?",
            500,
            "We'll see."
        ]);

        spriteFollower.disable();

        await NPCController.move(2.75);
        await NPCController.move(0,-2);
        await delay(800);
        antiPlayer.direction = "down";

        await delay(800);

        await world.say("Go. Leave. Do what you think you're supposed to do.");

        await Promise.all([
            camera.zoomTo(startScale,800),
            camera.moveTo(startX,startY,800)
        ]);

        spriteFollower.target = player;
        spriteFollower.enable();
        playerController.unlock();
    };

    const switchDoors = GetSwitchDoors(world,[[42,5,"red",false]],[[40,4,"red"]]);
    this.interact = data => {
        switchDoors.tryInteract(data);
    };

    world.setTriggers([
        GetTransitionTrigger(world,1,previousMap,"left"),
        GetTransitionTrigger(world,2,nextMap,"right"),
        [3,makeANewFriend,true]
    ]);
}
export default VoidHell;
