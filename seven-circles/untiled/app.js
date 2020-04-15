import "../script.js";
import AddColorBackground from "../src/scripts/helper/color-background.js";
import TilePicker from "./tile-picker.js";
import FakeWorld from "./fake-world.js";

const COLLISION_TILESET = "collision-tileset";
const INTERACTION_TILESET = "interaction-tileset";
const LIGHT_TILESET = "light-tileset";
const WORLD_TILESET = "world-tileset";
const MAP_DATA = "maps";

const ZOOM_RATE = 0.3;
const MIN_ZOOM = 1;
const MAX_SCALE = 8;
const MOUSE_PAN_SPEED = 8;

const { CanvasManager, ResourceManager } = Eleven;

function App() {

    const tilesets = {
        world: null,
        light: null,
        interaction: null,
        collision: null
    };
    let world = null;
    let maps = null;
    let tilePicker = null;

    CanvasManager.target = document.getElementById("canvas-container");

    const loadTilePicker = () => {
        tilePicker = new TilePicker();
        tilePicker.setTileset(tilesets.world);
        const { element } = tilePicker;

        const target = document.getElementById("right-side");
        const layers = document.getElementById("layers");

        target.appendChild(element);

        const setSize = () => {
            element.width = target.clientWidth;
            element.height = target.clientHeight - layers.clientHeight;
            tilePicker.update();
        };
        setSize();

        window.addEventListener("resize", setSize);
    };

    let tilesetList = null;

    const keyDown = event => {
        if(!event.repeat) {
            if(event.shiftKey) {
                switch(event.code) {
                    case "Digit1": this.sendAction("selectBackground"); break;
                    case "Digit2": this.sendAction("selectForeground"); break;
                    case "Digit3": this.sendAction("selectSuperForeground"); break;
                    case "Digit4": this.sendAction("selectCollision"); break;
                    case "Digit5": this.sendAction("selectInteraction"); break;
                    case "Digit6": this.sendAction("selectLighting"); break;
                }
            } else {
                switch(event.code) {
                    case "Digit1": this.sendAction("toggleBackground"); break;
                    case "Digit2": this.sendAction("toggleForeground"); break;
                    case "Digit3": this.sendAction("toggleSuperForeground"); break;
                    case "Digit4": this.sendAction("toggleCollision"); break;
                    case "Digit5": this.sendAction("toggleInteraction"); break;
                    case "Digit6": this.sendAction("toggleLighting"); break;
                    case "KeyO": this.sendAction("allVisible"); break;
                    case "KeyP": this.sendAction("allInvisible"); break;

                    case "KeyZ": this.sendAction("zoomIn"); break;
                    case "KeyX": this.sendAction("zoomOut"); break;

                    case "KeyW": this.sendAction("panUp"); break;
                    case "KeyA": this.sendAction("panLeft"); break;
                    case "KeyS": this.sendAction("panDown"); break;
                    case "KeyD": this.sendAction("panRight"); break;
                    
                    case "KeyG": this.sendAction("toggleGrid"); break;
                }
            }
        } else {
            switch(event.code) {
                case "KeyW": this.sendAction("panUp"); break;
                case "KeyA": this.sendAction("panLeft"); break;
                case "KeyS": this.sendAction("panDown"); break;
                case "KeyD": this.sendAction("panRight"); break;

                case "KeyZ": this.sendAction("zoomIn"); break;
                case "KeyX": this.sendAction("zoomOut"); break;
            }
        }
    };
    const keyUp = () => {

    };
    const pointerScroll = event => {
        const speed = event.shiftKey ? 0.5 : MOUSE_PAN_SPEED / world.camera.scale;
        if(event.altKey) {
            if(event.scrollingUp) {
                this.sendAction("panLeft",speed);
            } else {
                this.sendAction("panRight",speed);
            }
        } else if(event.ctrlKey) {
            if(event.scrollingUp) {
                this.sendAction("zoomInMouse");
            } else {
                this.sendAction("zoomOutMouse");
            }
        } else {
            if(event.scrollingUp) {
                this.sendAction("panUp",speed);
            } else {
                this.sendAction("panDown",speed);
            }
        }
    };

    const loadWorld = async() => {
        await CanvasManager.setFrame(FakeWorld, [tilesetList]);
        world = CanvasManager.frame;
        world.keyDown = keyDown; world.keyUp = keyUp;
        world.pointerScroll = pointerScroll;

        CanvasManager.paused = false;
        CanvasManager.markLoaded();

        world.camera.x = 10;
        world.camera.y = 10;
    };

    const setMap = mapName => {
        world.setMap(mapName);
        AddColorBackground(world,"#7F7F7F");
        const {grid} = world;
        world.dispatchRenderer.addBackground(context=>{
            const topLeft = grid.getLocation(0,0);
            const bottomRight = grid.getLocation(grid.width,grid.height);

            topLeft.x = Math.floor(topLeft.x) + 0.5;
            topLeft.y = Math.floor(topLeft.y) + 0.5;
         
            bottomRight.x = Math.floor(bottomRight.x) + 0.5;
            bottomRight.y = Math.floor(bottomRight.y) + 0.5;

            context.lineWidth = 1;
            context.strokeStyle = "black";

            context.beginPath();
            context.moveTo(topLeft.x,topLeft.y);
            context.lineTo(bottomRight.x,topLeft.y);
            context.lineTo(bottomRight.x,bottomRight.y);
            context.lineTo(topLeft.x,bottomRight.y);
            context.lineTo(topLeft.x,topLeft.y);
            context.stroke();
        });
        if(netGrid) {
            netGrid = null; toggleGrid();
        }
    };

    let loaded = false;
    this.load = () => {
        if (!loaded)(async() => {
            await ResourceManager.queueImage([
                COLLISION_TILESET, INTERACTION_TILESET,
                LIGHT_TILESET, WORLD_TILESET
            ]).queueJSON(MAP_DATA).load();
            tilesets.world = ResourceManager.getImage(WORLD_TILESET);
            tilesets.light = ResourceManager.getImage(LIGHT_TILESET);
            tilesets.interaction = ResourceManager.getImage(INTERACTION_TILESET);
            tilesets.collision = ResourceManager.getImage(COLLISION_TILESET);
            tilesetList = [
                tilesets.world, tilesets.world, tilesets.world,
                tilesets.collision, tilesets.interaction, tilesets.light
            ];
            maps = ResourceManager.getJSON(MAP_DATA);
            await loadWorld();
            loadTilePicker();

            setMap(maps["tunnels-of-hell"]);

            loaded = true;
        })();
    };

    const actionProcessor = (action, parameters) => {
        if (loaded) action.apply(this, parameters);
    };

    const selectButtons = document.body.querySelectorAll("button.select");
    const toggleButtons = document.body.querySelectorAll("button.toggle-visible");

    const toggleLayerVisible = layer => {
        const visibleLayers = world.getVisibleLayers();

        const button = toggleButtons[layer];
        if(visibleLayers[layer]) {
            button.textContent = "Invisible";
            button.classList.remove("active");
        } else {
            button.textContent = "Visible";
            button.classList.add("active");
        }

        visibleLayers[layer] = !visibleLayers[layer];
        world.setVisibleLayers(...visibleLayers);
    };
    const setLayerVisible = (layer,visible=true) => {
        const visibleLayers = world.getVisibleLayers();
        const button = toggleButtons[layer]
        button.textContent = visible ? "Visible" : "Invisible";
        if(!visible) {
            button.classList.add("active");
        }

        visibleLayers[layer] = visible;
        world.setVisibleLayers(...visibleLayers);
    };

    let activeLayer = 0;
    let lastSelection = 0;
    const styleActiveLayer = () => {
        selectButtons[lastSelection].classList.remove("active");
        selectButtons[activeLayer].classList.add("active");
    };
    const selectLayer = layer => {
        lastSelection = activeLayer;
        activeLayer = layer;
        styleActiveLayer();
    };
    styleActiveLayer();

    const getLayerSelect = layer => () => selectLayer(layer);
    const getLayerToggle = layer => () => toggleLayerVisible(layer);

    const setAllVisible = visible => {
        for(let i = 0;i<toggleButtons.length;i++) {
            const button = toggleButtons[i];
            button.textContent = visible ? "Visible" : "Invisible";
            if(visible) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        }
        world.setVisibleLayers(...(new Array(6)).fill(visible));
    };

    let netGrid = null;

    const toggleGrid = () => {
        if(netGrid !== null) {
            world.dispatchRenderer.removeFinalize(netGrid);
            netGrid = null;
        } else {
            const grid = world.grid;
            netGrid = world.dispatchRenderer.addFinalize((context)=>{
                const topLeft = grid.getLocation(0,0);
                const bottomRight = grid.getLocation(grid.width,grid.height);

                const size = grid.tileSize;

                topLeft.x = Math.floor(topLeft.x) + 0.5;
                topLeft.y = Math.floor(topLeft.y) + 0.5;
                bottomRight.x = Math.floor(bottomRight.x) + 0.5;
                bottomRight.y = Math.floor(bottomRight.y) + 0.5;

                let width = bottomRight.x - topLeft.x;
                let height = bottomRight.y - topLeft.y;

                for(let x = topLeft.x;x<bottomRight.x;x += size) {
                    context.beginPath();
                    context.moveTo(x,topLeft.y);
                    context.lineTo(x,topLeft.y+height);
                    context.stroke();
                }

                for(let y = topLeft.y;y<bottomRight.y;y += size) {
                    context.beginPath();
                    context.moveTo(topLeft.x,y);
                    context.lineTo(topLeft.x+width,y);
                    context.stroke();
                }
            });
        }
    };

    const pan = (direction,distance) => {
        let xDelta = 0, yDelta = 0;
        switch(direction) {
            case 0: yDelta = -1; break;
            case 1: yDelta = 1; break;
            case 2: xDelta = -1; break;
            case 3: xDelta = 1; break;
        }
        world.camera.x += xDelta * distance;
        world.camera.y += yDelta * distance;
    };
    const mouseZoom = zoomingIn => {
        const {pointer,size} = CanvasManager;
        const {x,y} = pointer;
        const {halfWidth,halfHeight} = size;
        const {camera, grid} = world;

        const startPosition = grid.getTileLocation(x,y);
        let zoomInTarget = startPosition;

        let worldCenter = grid.getTileLocation(halfWidth,halfHeight);

        const distanceToTarget = {
            x: worldCenter.x - zoomInTarget.x,
            y: worldCenter.y - zoomInTarget.y
        };

        const scaleChange = 1 + (zoomingIn ? ZOOM_RATE : -ZOOM_RATE);
        const startScale = camera.scale;
        let newScale = startScale;

        newScale *= scaleChange;
        if(newScale < MIN_ZOOM) {
            newScale = MIN_ZOOM;
        } else if(newScale > MAX_SCALE) {
            newScale = MAX_SCALE;
        }
        camera.scale = newScale;

        zoomInTarget = grid.getTileLocation(x,y);
        worldCenter = grid.getTileLocation(halfWidth,halfHeight);

        const newDistanceToTarget = {
            x: worldCenter.x - zoomInTarget.x,
            y: worldCenter.y - zoomInTarget.y
        };

        camera.x += newDistanceToTarget.x - distanceToTarget.x;
        camera.y += newDistanceToTarget.y - distanceToTarget.y;
    };

    const getPan = direction => (distance=1) => pan(direction,distance);
    const getMouseZoom = zoomingIn => () => mouseZoom(zoomingIn);

    const zoomPure = change => {
        const startZoom = world.camera.scale;
        let scale = startZoom + change;
        scale = Math.min(scale,MAX_SCALE);
        scale = Math.max(scale,MIN_ZOOM);
        if(scale === startZoom) return;
        world.camera.scale = scale;
    };
    const getPureZoom = change => () => zoomPure(change);

    const getSetAllVisible = visible => () => setAllVisible(visible);

    const actions = {
        selectBackground: getLayerSelect(0),
        selectForeground: getLayerSelect(1),
        selectSuperForeground: getLayerSelect(2),
        selectCollision: getLayerSelect(3),
        selectInteraction: getLayerSelect(4),
        selectLighting: getLayerSelect(5),

        toggleBackground: getLayerToggle(0),
        toggleForeground: getLayerToggle(1),
        toggleSuperForeground: getLayerToggle(2),
        toggleCollision: getLayerToggle(3),
        toggleInteraction: getLayerToggle(4),
        toggleLighting: getLayerToggle(5),

        allVisible: getSetAllVisible(true),
        allInvisible: getSetAllVisible(false),

        panLeft: getPan(2),
        panRight: getPan(3),
        panUp: getPan(0),
        panDown: getPan(1),

        zoomInMouse: getMouseZoom(true),
        zoomOutMouse: getMouseZoom(false),

        zoomIn: getPureZoom(1),
        zoomOut: getPureZoom(-1),

        toggleGrid: toggleGrid
    };

    const sendAction = (name, ...parameters) => {
        return actionProcessor(actions[name], parameters);
    };
    this.sendAction = sendAction;

    for(let i = 0; i < toggleButtons.length; i++) {
        (index => {
            toggleButtons[index].addEventListener("click", event => {
                if (event.button === 0) toggleLayerVisible(index);
            });
        })(i)
    }
}
const app = new App();
globalThis.Untiled = app;
app.load();
