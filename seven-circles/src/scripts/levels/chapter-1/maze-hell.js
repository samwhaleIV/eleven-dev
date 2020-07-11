import {SaveStone,Teleporter,InstallLevelChainTriggers,ObjectiveText, MessageChain} from "../helper.js";

function MazeHell({world,fromNextMap}) {
    world.setMap("c1-maze");
    const {camera} = world;
    camera.padding = true;

    const objective = new ObjectiveText(world);

    if(fromNextMap) {
        const player = world.addPlayer(61,66);
        player.direction = "up";
    } else {
        const player = world.addPlayer(4,2);
        player.direction = "down";
        this.start = () => {
            objective.set("Find your way through the maze!","escape");
        };
    }

    const saveStone = new SaveStone(world,59,64);
    const teleporter = new Teleporter(world,[[56,66,47,68]]);

    this.interact = data => {
        const {value} = data;
        if(value === 16) {
            MessageChain(world,[
                "I've been trying to get through this maze for longer than I can remember.",
                "I left arrows to help guide me, but they haven't helped.",
                "It's almost as if they tell me the opposite way to go."
            ]);
            return;
        } else if(value === 17) {
            world.message("It's a pile of arrows.");
            return;
        } else if(value === 18) {
            MessageChain(world,[
                "What are you doing here?",
                "Can't a skeledemon drink chocolate milk in peace?",
                "I even switched an arrow around to keep people away!"
            ]);
            return;
        } else if(value === 19) {
            return world.sayNamed("Even though I know exactly which way to go, I still hate mazes.","Mysterious Lamp","r");
        }
        if(teleporter.tryInteract(data)) {
            if(objective.status === "escape") {
                objective.close();
            }
            return;
        };
        if(saveStone.tryInteract(data)) return;
    };
    
    InstallLevelChainTriggers(world);
}
export default MazeHell;
