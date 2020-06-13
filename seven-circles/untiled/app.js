import AddColorBackground from "../src/scripts/helper/backgrounds/color-background.js";
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

    const wallCollisionTypes = {7:1,8:1};

    const fillSimilars = (sets=>{
        const table = new Object();
        for(const set of sets) {
            const group = new Object();
            for(const value of set) {
                table[value] = group;
                group[value] = true;
            }
        }
        return table;
    })([
        [71,72,135,136,832,833], //Hell floor
        [7,8] //Hell wall
    ]);
    const isFillSimilar = (a,b) => {
        if(a === b) return true;
        return a in fillSimilars && b in fillSimilars;
    };

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

    const tileIDDisplay = document.getElementById("tile-ID-display");

    const setTileIDDisplay = value => {
        if(value !== null) {
            tileIDDisplay.style.display = "block";
            tileIDDisplay.textContent = `Tile ID: ${value}`;
        } else {
            tileIDDisplay.style.display = "none";
        }
    };

    const updateTileIDDisplay = () => {
        if(brush.width === 1 && brush.height === 1 && Array.isArray(brush.value)) {
            setTileIDDisplay(brush.value[0][0]);
        } else {
            setTileIDDisplay(null);
        }
    };

    this.updateBrush = newBrush => {
        brush = newBrush;
        updateTileIDDisplay();
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

    const tilesetList = [];

    const actionTable = {
        repeat: {
            KeyW: "panUp",
            KeyA: "panLeft",
            KeyS: "panDown",
            KeyD: "panRight",
            KeyZ: "zoomIn",
            KeyX: "zoomOut",
            KeyF: "fillSelection",
        },
        ctrl: {
            KeyZ: "undo",
            KeyY: "redo",
            KeyR: "reloadTilesets"
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
                if(tileValue === null || (!erasing && tileValue === 0)) {
                    return;
                }
                historyBuffer.push({
                    x:tileX,y:tileY,layer:activeLayer,value:tileValue,oldValue:world.get(tileX,tileY,activeLayer)
                });
                world.set(tileX,tileY,tileValue,activeLayer);
            }
        }
    };

    const wallCollisionFill = () => {
        const {width,height} = world.grid;
        for(let x = 0;x<width;x++) {
            for(let y = 0;y<height;y++) {
                const value = world.get(x,y,0)
                if(value in wallCollisionTypes) {
                    const collisionValue = wallCollisionTypes[value];
                    historyBuffer.push({
                        x,y,layer:3,value:collisionValue,oldValue:world.get(x,y,3)
                    });
                    world.set(x,y,collisionValue,3);
                }
            }
        }
        const buffer = historyBuffer.splice(0);
        if(redoStack.length) redoStack.splice(0);
        eventStack.push(buffer);
    };

    const getFillValue = () => {
        if(erasing) {
            return 0;
        } else if(randomModeOn) {
            return getRandomBrushIndex();
        } else {
            return brush.value[0][0];
        }
    };

    const cardinalMatrix = [[1,0],[-1,0],[0,1],[0,-1]];

    let targetColor = null;
    const floodFill = (x,y) => {
        /* Reworked from https://en.wikipedia.org/wiki/Flood_fill */

        if(x < 0 || x >= world.grid.width || y < 0 || y >= world.grid.height) return;

        const color = world.get(x,y,activeLayer);
        let replacementColor = getFillValue();

        if(isFillSimilar(replacementColor,targetColor) || !isFillSimilar(color,targetColor)) return;

        historyBuffer.push({
            x,y,layer:activeLayer,
            value:replacementColor,oldValue:color
        });
        world.set(x,y,replacementColor,activeLayer);
    
        const queue = new Array();
        queue.push([x,y]);
        while(queue.length) {
            const [x,y] = queue.shift();
            for(const [xOffset,yOffset] of cardinalMatrix) {
                const nodeX = x + xOffset, nodeY = y + yOffset;
                const nodeColor = world.get(nodeX,nodeY,activeLayer);
                if(isFillSimilar(nodeColor,targetColor)) {
                    queue.push([nodeX,nodeY]);

                    replacementColor = getFillValue();
                    historyBuffer.push({
                        x:nodeX,y:nodeY,layer:activeLayer,
                        value:replacementColor,oldValue:nodeColor
                    });
                    world.set(nodeX,nodeY,replacementColor,activeLayer);
                }
            }
        }
    };

    const fill = () => {
        if(targetColor !== null) return;
        const {x,y} = selection;
        targetColor = world.get(x,y,activeLayer);
        floodFill(x,y);
        targetColor = null;
        const buffer = historyBuffer.splice(0);
        if(redoStack.length) redoStack.splice(0);
        eventStack.push(buffer);
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
        if(!loaded) return;
        if(!world.getVisibleLayers()[activeLayer]) {
            return;
        }
        painting = true;
        paint();
    };
    const clickUp = () => {
        if(!loaded) return;
        painting = false;
        lastPaint = null;
        const buffer = historyBuffer.splice(0);
        if(redoStack.length) redoStack.splice(0);
        eventStack.push(buffer);
    };
    const pointerMove = ({x,y}) => {
        if(!loaded) return;
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

    const setTitle = title => {
        document.getElementById("title").textContent = title;
    };

    this.mapName = null;

    const setMap = mapName => {
        world.setMap(maps[mapName]);
        setTitle(mapName);
        this.mapName = mapName;

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

    let loadingTileset = false;
    const loadTilesetImages = async () => {
        if(loadingTileset) return;
        const startedPaused = CanvasManager.paused;
        if(!startedPaused) {
            CanvasManager.paused = true;
        }
        loadingTileset = true;
        await ResourceManager.queueImage([
            COLLISION_TILESET, INTERACTION_TILESET,
            LIGHT_TILESET, WORLD_TILESET
        ]).load(true);

        tilesets.world = ResourceManager.getImage(WORLD_TILESET);
        tilesets.light = ResourceManager.getImage(LIGHT_TILESET);
        tilesets.interaction = ResourceManager.getImage(INTERACTION_TILESET);
        tilesets.collision = ResourceManager.getImage(COLLISION_TILESET);

        tilesetList[0] = tilesets.world;
        tilesetList[1] = tilesets.world;
        tilesetList[2] = tilesets.world;
        tilesetList[3] = tilesets.collision;
        tilesetList[4] = tilesets.interaction;
        tilesetList[5] = tilesets.light;
        loadingTileset = false;
        if(!startedPaused) {
            CanvasManager.paused = false;
        }
    };

    const importMaps = async () => {
        await ResourceManager.queueJSON(MAP_DATA).load();
        maps = ResourceManager.getJSON(MAP_DATA);
    };

    const exportMaps = () => {
        const text = JSON.stringify(maps);
        const blob = new Blob([text],{type:"application/json"});

        const formData = new FormData();
        formData.append("mapData",blob);

        fetch("/upload-map-data",{
            method: "POST",
            body: formData
        });

        alert("Exported!");
    };

    let loaded = false;
    this.load = () => {
        if(!loaded)(async() => {
            await loadTilesetImages();
            await importMaps();
            await loadWorld();

            loadTilePicker();
            loaded = true;
        })();
    };

    const actionProcessor = (action,parameters) => {
        if(loaded) action.apply(this,parameters);
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

    const selectLayer = layer => {
        const visibleLayers = world.getVisibleLayers();
        const visCount = visibleLayers.reduce((total,layer,index)=>{
            if(layer) {
                return total + 1;
            } else {
                visibleLayers[index] = false;
                return total;
            }
        },0);

        if(visCount <= 1) {
            world.pauseCache();
            setAllVisible(false);
            setLayerVisible(layer,true);
            world.resumeCache();
        }

        lastSelection = activeLayer;
        activeLayer = layer;
        tilePicker.setTileset(tilesetList[layer]);
        styleActiveLayer();
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
                context.setLineDash([1,3]);
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
                context.setLineDash([]);
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

    const reloadTilesets = async () => {
        await loadTilesetImages();
        tilePicker.setTileset(tilesetList[activeLayer]);
        if(this.mapName) world.resumeCache();
    };

    const getNewMap = (width=100,height=100) => {
        return {width, height, layerCount: 6,encoded: false};
    };

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
        },

        reloadTilesets: reloadTilesets,

        openMap: () => {
            const mapName = prompt("Map name");
            if(!mapName) return;

            if(!(mapName in maps)) {
                let i = 1, testName = mapName;
                while((!testName in maps)) {
                    testName = `Untitled Map ${i}`;
                    i++;
                }
                maps[testName] = getNewMap();
                setMap(testName);
            } else {
                setMap(mapName);
            }
        },
        fillSelection: () => {
            const visibleLayers = world.getVisibleLayers();
            if(activeLayer === 3 && visibleLayers[3] && visibleLayers[0]) {
                wallCollisionFill();
            } else {
                fill();
            }
        },

        saveMap: () => {
            if(!this.mapName) return;
            const newMap = world.tileRenderer.exportLayer(true);
            const mapName = this.mapName;
            maps[mapName] = newMap;
            alert("Saved map!");
        },

        exportMaps: exportMaps,

        resizeMap: () => {
            const mapName = this.mapName;
            if(!mapName) return;

            const result = prompt(
                "width, height, x offset, y offset",`${world.grid.width},${world.grid.height},${0},${0}`
            ).split(",");
            if(!result) return;

            let [width,height,xOffset,yOffset] = result;
            
            width = Number(width);
            height = Number(height);
            xOffset = Number(xOffset);
            yOffset = Number(yOffset);
            
            const startData = maps[mapName];

            const layerData = world.tileRenderer.exportLayer(false);
            
            const {
                background,
                foreground,
                superForeground,
                collision,
                interaction,
                lighting,
                columns,
            } = layerData;

            maps[mapName] = getNewMap(width,height);
            setMap(mapName);

            world.pauseCache();

            const layerSize = background.length;
            for(let i = 0;i<layerSize;i++) {
                const tileX = i % columns + xOffset;
                const tileY = Math.floor(i / columns) + yOffset;

                if(tileX >= width || tileY >= height) continue;

                world.set(tileX,tileY,background[i],0);
                world.set(tileX,tileY,foreground[i],1);
                world.set(tileX,tileY,superForeground[i],2);

                world.set(tileX,tileY,collision[i],3);
                world.set(tileX,tileY,interaction[i],4);
                world.set(tileX,tileY,lighting[i],5);
            }

            maps[mapName] = startData;
            world.resumeCache();
        }
    };

    const sendAction = (name, ...parameters) => {
        return actionProcessor(actions[name], parameters);
    };
    this.sendAction = sendAction;

    for(let i = 0;i<6;i++) {(index => {
        toggleButtons[index].addEventListener(
            "click", event => event.button === 0 ? toggleLayerVisible(index) : undefined
        );
        selectButtons[index].addEventListener(
            "click", event => event.button === 0 ? selectLayer(index) : undefined
        );
    })(i)}

    (buttons => buttons.forEach(([ID,action])=>{
        document.getElementById(`${ID}-button`).onclick = event => 
        event.button === 0 ? sendAction(action) : undefined;
    }))([
        ["open","openMap"],["save","saveMap"],
        ["resize","resizeMap"],["export","exportMaps"]
    ]);
}
const app = new App();
globalThis.Untiled = app;
app.load();
