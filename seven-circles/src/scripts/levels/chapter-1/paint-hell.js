import {
    ClawMachine,
    SpriteDoor,
    PanPreview,
    ObjectiveText,
    InstallLevelChainTriggers
} from "../helper.js";

const CANVAS = [918,919];
const BLUEPRINT = [982,983];
const PAINT = [1046,1047];

const DRAWING_OUTLINE = 31;
const DRAWING_CENTER = 30;

const ITEM_HOLE_COUNT = 4;

const HOLE_INTERACTION = 16;

const BAD_HOLE = 0;
const GOOD_HOLE = 1;
const EMPTY_HOLE = 2;

const DOOR_ID = 17;

function PaintHell({world,inventory,fromNextMap}) {

    world.setMap("c1-paint");
    world.camera.padding = true;
    if(fromNextMap) {
        const player = world.addPlayer(7,33);
        player.direction = "up";
    } else {
        const player = world.addPlayer(22,2);
        player.direction = "down";
    }

    const objective = new ObjectiveText(world);

    this.unload = () => {
        inventory.clear("blueprint-fragment");
    };
    this.unload();

    this.start = () => {
        if(!fromNextMap) {
            objective.set("Locate blueprint fragments!","find-blueprints");
        }
        return false;
    };

    const {tileRenderer} = world;

    let paintTileCount = 0;
    let paintedCount = 0;

    const checkerPatternPolarity = true;

    const heartPattern = new Array();
    const blueprintExposed = {};

    const blueprintHoles = {};

    let blueprintHoleCount = 0;

    const getCheckerIdx = (x,y) => ((x + y) % 2 === 0) === checkerPatternPolarity ? 0 : 1;

    tileRenderer.readLayer(4).forEach((value,idx)=>{
        if(value === HOLE_INTERACTION) {
            blueprintHoleCount++;
            blueprintHoles[idx] = BAD_HOLE;
            return;
        }
        if(!(value === DRAWING_CENTER || value === DRAWING_OUTLINE)) return;
        const position = tileRenderer.getXY(idx);
        const [x,y] = position;

        const checkerIdx = getCheckerIdx(x,y);

        world.setBackgroundTile(x,y,CANVAS[checkerIdx]);

        position.push(idx);
        heartPattern.push(position);

        paintTileCount++;
    });

    const fragmentStride = Math.ceil(heartPattern.length/ITEM_HOLE_COUNT);

    const popRandomEntry = set => set.splice(Math.floor(Math.random()*set.length),1)[0];

    const spriteDoor = new SpriteDoor(world,14,33,"grayDoor",false,1000,DOOR_ID);

    (()=>{
        const holes = Object.keys(blueprintHoles);
        if(ITEM_HOLE_COUNT > blueprintHoles) {
            throw Error("The map doesn't have enough holes!");
        }
        for(let i = 0;i<ITEM_HOLE_COUNT;i++) {
            const hole = popRandomEntry(holes);
            blueprintHoles[hole] = GOOD_HOLE;
        }
    })();

    const clawMachine = new ClawMachine(world,17,10,31,24,[[24,9]],(x,y)=>{
        const idx = tileRenderer.getIdx(x,y);
        if(!(idx in blueprintExposed)) return;
        const ID = world.getInteractionTile(x,y);
        if(ID === DRAWING_OUTLINE) {
            world.setBackgroundTile(x,y,PAINT[1]);
        } else if(ID === DRAWING_CENTER) {
            world.setBackgroundTile(x,y,PAINT[0]);
        } else return;
        if(!blueprintExposed[idx]) return;
        blueprintExposed[idx] = false;
        world.playSound("ClawMachinePaint");
        if(++paintedCount === paintTileCount) {
            if(objective.status === "complete-canvas") {
                objective.close();
            }
            endOfTheCanvas();
        }
    });

    const endOfTheCanvas = async () => {
        const {spriteFollower,player,playerController} = world;
        await clawMachine.exit();

        spriteFollower.disable();
        spriteFollower.target = player;

        await PanPreview({
            world,x:14,y:34,endX:player.camX,endY:player.camY,
            middleEvent: async () => {
                await frameDelay(500);
                spriteDoor.open();
            }
        });

        playerController.unlock();
    };

    const heartPatternComplete = () => heartPattern.length === 0;

    const useFragment = () => {
        if(heartPatternComplete()) {
            world.message("The blueprint is already complete. How did you get more fragments, anyhow?");
            return;
        }
        let i = 0;
        while(!heartPatternComplete() && i++ < fragmentStride) {
            const [x,y,idx] = popRandomEntry(heartPattern);
            blueprintExposed[idx] = true;
            world.setBackgroundTile(x,y,BLUEPRINT[getCheckerIdx(x,y)]);
        }
        const complete = heartPatternComplete();
        world.message(complete ? "The blueprint is complete!" : "The fragment helps you see the bigger picture!");
        if(complete) {
            if(objective.status === "find-blueprints") {
                objective.set("Complete the canvas!","complete-canvas");
            }
        }
    };

    const isBaseStation = value => value in clawMachine.baseStationIDs;

    let blueprintsGained = 0;

    this.interact = async data => {
        if(data.value === 17) {
            world.sayNamed("You know, I'm something of an artist myself.","Mysterious Lamp","r");
            return;
        }
        if(isBaseStation(data.value) && inventory.has("blueprint-fragment")) {
            useFragment();
            inventory.take("blueprint-fragment");
            return;
        }
        if(spriteDoor.tryInteract(data,()=>{
            if(spriteDoor.opened) return;
            world.message("The door won't open until the canvas is complete!");
        })) return;
        if(clawMachine.tryInteract(data)) return;
        if(data.value === HOLE_INTERACTION) {
            const {x,y} = data;
            const idx = tileRenderer.getIdx(x,y);
            const state = blueprintHoles[idx];
            if(state === GOOD_HOLE) {
                await world.message("The hole looks like it has a blueprint fragment in it!");
                inventory.give("blueprint-fragment");
                blueprintsGained++;
                if(blueprintsGained === ITEM_HOLE_COUNT) {
                    objective.set("All blueprints found!");
                }
                blueprintHoles[idx] = EMPTY_HOLE;
            } else if(state === EMPTY_HOLE) {
                world.message("You already found something in this hole.");
            } else {
                world.message("The hole only has air inside it. Maybe try another hole?");
            }
        }
    };

    InstallLevelChainTriggers(world);
}
export default PaintHell;
