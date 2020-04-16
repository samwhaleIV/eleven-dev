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

    const eventStack = [];
    const redoStack = [];

    let activeLayer = 0;

    let brush = {
        width: 1,
        height: 1,
        value: null
    };

    this.updateBrush = newBrush => {
        brush = newBrush;
    };

    const undo = () => {
        if(!eventStack.length) return;
        const undoEvent = eventStack.pop();

        if(undoEvent.length) {
            world.pauseCache();
            for(let i = undoEvent.length-1;i>=0;i--) {
                const {x,y,layer,oldValue} = undoEvent[i];
                world.set(x,y,oldValue,layer);
            }
            world.resumeCache();
        }

        redoStack.push(undoEvent);
    };

    const redo = () => {
        if(!redoStack.length) return;

        const redoEvent = redoStack.pop();
        if(redoEvent.length) {
            world.pauseCache();
            redoEvent.forEach(({x,y,layer,value})=>{
                world.set(x,y,value,layer);
            });
            world.resumeCache();
        }

        eventStack.push(redoEvent);
    };

    let erasing = false;
    let randomModeOn = true;

    const toggleRandomMode = () => {
        randomModeOn = !randomModeOn;
        document.getElementById("random-mode-label").innerText = randomModeOn ? "Random mode on" : "Random mode off";
    };
    toggleRandomMode();

    CanvasManager.target = document.getElementById("canvas-container");

    const loadTilePicker = () => {
        tilePicker = new TilePicker(this);
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

    const actionTable = {
        repeat: {
            KeyW: "panUp",
            KeyA: "panLeft",
            KeyS: "panDown",
            KeyD: "panRight",
            KeyZ: "zoomIn",
            KeyX: "zoomOut"
        },
        ctrl: {
            KeyZ: "undo",
            KeyY: "redo"
        },
        shift: {
            Digit1: "toggleBackground",
            Digit2: "toggleForeground",
            Digit3: "toggleSuperForeground",
            Digit4: "toggleCollision",
            Digit5: "toggleInteraction",
            Digit6: "toggleLighting"
        },
        noRepeat: {
            Digit1: "selectBackground",
            Digit2: "selectForeground",
            Digit3: "selectSuperForeground",
            Digit4: "selectCollision",
            Digit5: "selectInteraction",
            Digit6: "selectLighting",
            KeyO: "allVisible",
            KeyP: "allInvisible",
            KeyG: "toggleGrid",
            KeyR: "toggleRandomMode",
            KeyB: "brushMode",
            KeyE: "eraserMode",
            KeyQ: "setLayerOnlyVisible"
        }
    };

    Object.assign(actionTable.noRepeat,actionTable.repeat);

    const keyDown = ({repeat,code,shiftKey,ctrlKey}) => {
        let action = null;
        if(ctrlKey) {
            action = actionTable.ctrl[code];
        } else if(shiftKey) {
            action = actionTable.shift[code];
        } else if(repeat) {
            action = actionTable.repeat[code];
        } else {
            action = actionTable.noRepeat[code];
        }
        if(action) this.sendAction(action);
    };

    let painting = false;
    let selection = {x:0,y:0};

    let lastPaint = null;

    const getRandomBrushIndex = () => {
        const x = Math.floor(Math.random()*brush.width);
        const y = Math.floor(Math.random()*brush.height);
        return brush.value[y][x];
    };

    const historyBuffer = new Array();

    const stamp = (stampX,stampY) => {
        let width = 1, height = 1;
        if(!randomModeOn && !erasing) {
            width = brush.width;
            height = brush.height;
        }
        for(let x = 0;x<width;x++) {
            for(let y = 0;y<height;y++) {
                let tileValue = 0;
                const tileX = x + stampX;
                const tileY = y + stampY;
                if(erasing) {
                    tileValue = 0;
                } else if(randomModeOn) {
                    tileValue = getRandomBrushIndex();
                } else {
                    tileValue = brush.value[y][x];
                }
                historyBuffer.push({
                    x:tileX,y:tileY,layer:activeLayer,value:tileValue,oldValue:world.get(tileX,tileY,activeLayer)
                });
                world.set(tileX,tileY,tileValue,activeLayer);
            }
        }
    };

    const paint = () => {

        if(!lastPaint) {
            stamp(selection.x,selection.y);
            lastPaint = Object.assign({},selection);
            return;
        }

        const xDif = lastPaint.x - selection.x;
        const yDif = lastPaint.y - selection.y;

        if(xDif !== 0) {
            if(xDif < 0) { //last paint x is less than select
                for(let x = xDif;x<=0;x++) {
                    stamp(selection.x+x,selection.y);
                }
            } else {
                for(let x = xDif;x>=0;x--) {
                    stamp(selection.x+x,selection.y);
                }
            }
        }
        if(yDif !== 0) {
            if(yDif < 0) {
                for(let y = yDif;y<=0;y++) {
                    stamp(selection.x,selection.y+y);
                }
            } else {
                for(let y = yDif;y>=0;y--) {
                    stamp(selection.x,selection.y+y);
                }
            }
        }

        lastPaint.x = selection.x;
        lastPaint.y = selection.y;

        console.log("Paint!");
    };

    const setSelection = (x,y) => {
        const didChange = selection.x !== x || selection.y !== y;

        selection.x = x; selection.y = y;
        if(didChange) {
            if(painting) paint();
            document.getElementById("position").innerText = `${selection.x},${selection.y}`;
        }
    };
    const clickDown = () => {
        if(!world.getVisibleLayers()[activeLayer]) {
            return;
        }
        painting = true;
        paint();
    };
    const clickUp = () => {
        painting = false;
        lastPaint = null;
        const buffer = historyBuffer.splice(0);
        if(redoStack.length) redoStack.splice(0);
        eventStack.push(buffer);
    };
    const pointerMove = ({x,y}) => {
        const tileLocation = world.grid.getTileLocation(x,y);
        setSelection(
            Math.floor(tileLocation.x),
            Math.floor(tileLocation.y)
        );
    };

    const pointerScroll = event => {
        const speed = event.shiftKey ? 0.5 : Math.floor(MOUSE_PAN_SPEED / world.camera.scale);
        if(event.altKey) {
            if(event.scrollingUp) {
                this.sendAction("panLeftMouse",speed);
            } else {
                this.sendAction("panRightMouse",speed);
            }
        } else if(event.ctrlKey) {
            if(event.scrollingUp) {
                this.sendAction("zoomInMouse");
            } else {
                this.sendAction("zoomOutMouse");
            }
        } else {
            if(event.scrollingUp) {
                this.sendAction("panUpMouse",speed);
            } else {
                this.sendAction("panDownMouse",speed);
            }
        }
    };

    const loadWorld = async() => {
        await CanvasManager.setFrame(FakeWorld,[tilesetList]);
        world = CanvasManager.frame;
        world.keyDown = keyDown;
        world.pointerScroll = pointerScroll;
        world.pointerMove = pointerMove;
        world.clickDown = clickDown;
        world.clickUp = clickUp;

        CanvasManager.paused = false;
        CanvasManager.markLoaded();

        world.camera.x = 10;
        world.camera.y = 10;
    };

    const getTextureXY = (image,index) => {
        const columns = image.width / 16;

        return [index % columns * 16,Math.floor(index / columns) * 16];
    };

    const setMap = mapName => {
        world.setMap(mapName);
        eventStack.splice(); redoStack.splice();

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

        world.dispatchRenderer.addFinalize(context=>{

            const size = grid.tileSize;

            const renderPosition = grid.getLocation(selection.x,selection.y);

            if(brush.value === null || erasing) {
                context.fillStyle = erasing ? "rgba(255,0,0,0.5)" : "rgba(0,255,255,0.5)";
                context.fillRect(renderPosition.x,renderPosition.y,size,size);
            } else {
                let width = 1, height = 1;
                if(!randomModeOn) {
                    width = brush.width;
                    height = brush.height;
                }

                context.globalAlpha = 0.5;
                for(let x = 0;x<width;x++) {
                    for(let y = 0;y<height;y++) {
                        const image = tilesetList[activeLayer];
                        const value = brush.value[y][x];
                        if(value <= 0) continue;
                        const [texX,texY] = getTextureXY(image,value);
                        context.drawImage(
                            image,texX,texY,16,16,
                            renderPosition.x+x*size,renderPosition.y+y*size,size,size
                        );
                    }
                }
                context.globalAlpha = 1;
            }

        });
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
        const button = toggleButtons[layer];
        button.textContent = visible ? "Visible" : "Invisible";
        if(!visible) {
            button.classList.remove("active");
        } else {
            button.classList.add("active");
        }
        visibleLayers[layer] = visible;
        world.setVisibleLayers(...visibleLayers);
    };

    let lastSelection = 0;
    const styleActiveLayer = () => {
        selectButtons[lastSelection].classList.remove("active");
        selectButtons[activeLayer].classList.add("active");
    };
    const selectLayer = layer => {
        lastSelection = activeLayer;
        activeLayer = layer;
        tilePicker.setTileset(tilesetList[layer]);
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
            },-1);
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

    const getPan = (direction,withSelectionChange) => {
        if(!withSelectionChange) {
            return (distance=1) => {
                pan(direction,distance);
                world.grid.updateRenderData();
                pointerMove(CanvasManager.pointer);
            }
        } else {
            return (distance=1) => {

                let {x,y} = selection;

                switch(direction) {
                    case 0: y=Math.floor(y-1); break;
                    case 1: y=Math.floor(y+1); break;
                    case 2: x=Math.floor(x-1); break;
                    case 3: x=Math.floor(x+1); break;
                }

                setSelection(x,y);
                
                return pan(direction,distance);
            };
        }
    };

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

        panLeft: getPan(2,true),
        panRight: getPan(3,true),
        panUp: getPan(0,true),
        panDown: getPan(1,true),

        panLeftMouse: getPan(2,false),
        panRightMouse: getPan(3,false),
        panUpMouse: getPan(0,false),
        panDownMouse: getPan(1,false),

        zoomInMouse: getMouseZoom(true),
        zoomOutMouse: getMouseZoom(false),

        zoomIn: getPureZoom(1),
        zoomOut: getPureZoom(-1),

        toggleGrid: toggleGrid,

        undo: undo,
        redo: redo,
        toggleRandomMode: toggleRandomMode,

        eraserMode: () => erasing = true,
        brushMode: () => erasing = false,

        setLayerOnlyVisible: () => {
            setAllVisible(false);
            setLayerVisible(activeLayer,true);
        }
    };

    const sendAction = (name, ...parameters) => {
        return actionProcessor(actions[name], parameters);
    };
    this.sendAction = sendAction;

    for(let i = 0; i < toggleButtons.length; i++) {
        (index => {
            toggleButtons[index].addEventListener("click", event => {
                if(event.button === 0) toggleLayerVisible(index);
            });
        })(i)
    }
    for(let i = 0; i < selectButtons.length; i++) {
        (index => {
            selectButtons[index].addEventListener("click", event => {
                if(event.button === 0) selectLayer(index);
            });
        })(i)
    }
}
const app = new App();
globalThis.Untiled = app;
app.load();
