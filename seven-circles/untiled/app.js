import "../script.js";

import World from "../src/world/world.js";
import AddColorBackground from "../src/scripts/helper/color-background.js";

const COLLISION_TILESET = "collision-tileset";
const INTERACTION_TILESET = "interaction-tileset";
const LIGHT_TILESET = "light-tileset";
const WORLD_TILESET = "world-tileset";
const MAP_DATA = "maps.json";

const {CanvasManager,ResourceManager} = Eleven;

function App() {

    const tilesets = {
        world: null,
        light: null,
        interaction: null,
        collision: null
    };
    let world = null;
    let maps = null;

    CanvasManager.target = document.getElementById("canvas-container");

    const loadWorld = async () => {
        await CanvasManager.setFrame(World,[null,true]);
        world = CanvasManager.frame;

        CanvasManager.paused = false;
        CanvasManager.markLoaded();

        setMap("tunnels-of-hell");
        world.camera.x = 10;
        world.camera.y = 10;

        const frame = CanvasManager.frame;
        const panZoom = frame.grid.getPanZoom();
        frame.spriteFollower.disable();
        panZoom.bindToFrame(frame);
    };

    const loadTilePicker = () => {

    };

    const setMap = mapName => {
        world.setMap(mapName);
        AddColorBackground(world,"#7F7F7F");
    };

    let loaded = false;
    this.load = () => {if(!loaded) (async ()=>{
        await ResourceManager.queueImage([
            COLLISION_TILESET,INTERACTION_TILESET,
            LIGHT_TILESET,WORLD_TILESET
        ]).queueJSON(MAP_DATA).load();
        tilesets.world = ResourceManager.getImage(WORLD_TILESET);
        tilesets.light = ResourceManager.getImage(LIGHT_TILESET);
        tilesets.interaction = ResourceManager.getImage(INTERACTION_TILESET);
        tilesets.collision = ResourceManager.getImage(COLLISION_TILESET);
        maps = ResourceManager.getJSON(MAP_DATA);
        await loadWorld();
        loadTilePicker();
    })()};

    console.log("Untiled app loaded!");

}
const app = new App();
globalThis.Untiled = app;
app.load();