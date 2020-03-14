const BASE_TILE_SIZE = 16;

const DEFAULT_CAMERA_SCALE = 7;

const BACKGROUND_LAYER = 0;
const FOREGROUND_LAYER = 1;
const SUPER_FOREGROUND_LAYER = 2;
const COLLISION_LAYER = 3;
const INTERACTION_LAYER = 4;
const LIGHTING_LAYER = 5;

const TILESET_NAME = "world-tileset";
const TILESET_FILE_TYPE = ".png";
const MAPS_NAME = "maps";
const MAPS_FILE_TYPE = ".json";

const MOVE_UP = "MoveUp";
const MOVE_LEFT = "MoveLeft";
const MOVE_RIGHT = "MoveRight";
const MOVE_DOWN = "MoveDown";
const CLICK = "Enter";

const PLAYER_SPRITE = "player";
const PLAYER_SPRITE_FILE_TYPE = ".png";

const PLAYER_Z_INDEX = 1000;

const {
    ResourceManager,
    Grid2D,
    SpriteLayer,
    ManagedGamepad,
    KeyBind,
    SpriteFollower,
    UVTCLighting,
    DispatchRenderer,
    TileCollision,
    PlayerController,
    InstallHitBox,
    AnimatedSprite,
    TextLayer,
    SpeechBox,
    WorldImpulse
} = Eleven;

let tileset = null;
let maps = null;
let playerImage = null;

function getDefaultPlayerSprite(x,y) {
    return new AnimatedSprite(ResourceManager.getImage("player"),x,y);
}

function getInputDevices() {
    const keyBind = new KeyBind({
        "KeyW": MOVE_UP,
        "KeyS": MOVE_DOWN,
        "KeyA": MOVE_LEFT,
        "KeyD": MOVE_RIGHT,
        "Enter": CLICK,
        ArrowUp: MOVE_UP,
        ArrowDown: MOVE_DOWN,
        ArrowLeft: MOVE_LEFT,
        ArrowRight: MOVE_RIGHT,
    });
    const managedGamepad = new ManagedGamepad({
        binds: {
            Up: MOVE_UP,
            Down: MOVE_DOWN,
            Left: MOVE_LEFT,
            Right: MOVE_RIGHT,
            ButtonA: CLICK
        },
        whitelist: true,
        triggerThreshold: 0.1,
        repeatButtons: false,
        repeatAxes: false,
        repeatTriggers: false,
        repeatDelay: 200,
        repeatRate: 150,
        axisDeadzone: 0.7,
        manageLeftAxis: true,
        manageRightAxis: false,
        compositeLeftAxis: true,
        compositeRightAxis: false
    });
    return {keyBind, managedGamepad};
}

function dispatchMessage(dispatchRenderer,text) {

    const textLayer = new TextLayer({
        text: text,
        rowSpacing: 1,
        boxPadding: 4,
        scale: 4,
        textSpacing: 0.5,
        width: 790,
        height: 400
    });
    const ID = dispatchRenderer.addRender((context,{halfWidth,height})=>{
        const x = Math.floor(halfWidth - textLayer.width / 2);
        const y = height - textLayer.height - 10;
        context.fillStyle = "white";
        context.fillRect(x,y,textLayer.width,textLayer.height);
        textLayer.render(context,x,y);
    });

    let finished = false;

    const speechBox = new SpeechBox(textLayer);

    (async ()=>{
        await speechBox.start();
        finished = true;
    })();

    return () => {
        if(!finished) {
            speechBox.finish();
            return false;
        }
        dispatchRenderer.removeRender(ID);
        return true;
    };
}

function Controller(world,sprite) {

    let oldMessage = null;

    const messageBase = dispatchMessage.bind(null,world.dispatchRenderer);

    const speechBox = async text => {
        playerController.lock();
        oldMessage = messageBase(text);
    }; //use later

    const {collisionLayer, tileCollision} = world;
    
    const playerController = new PlayerController(
        sprite,collisionLayer,tileCollision
    );

    const input = playerController.getInputHandler({
        [MOVE_DOWN]: "down", [MOVE_RIGHT]: "right",
        [MOVE_UP]: "up", [MOVE_LEFT]: "left"
    });

    const worldImpulse = new WorldImpulse(sprite,collisionLayer,tileCollision);
    worldImpulse.layerHandler = sprite => {
        if(sprite.impulse) sprite.impulse(worldImpulse.source);
    };

    world.spriteFollower.target = sprite;
    world.spriteFollower.enabled = true;

    const keyDown = event => {
        if(event.impulse === CLICK) {
            if(event.repeat) return;
            if(oldMessage) {
                if(oldMessage()) {
                    oldMessage = null;
                    playerController.locked = false;
                }
                return;
            }
            if(playerController.locked) return;
            console.log(worldImpulse.impulse());
            return;
        }
        input.keyDown(event);
    };
    const keyUp = input.keyUp;

    world.managedGamepad.keyDown = keyDown;
    world.managedGamepad.keyUp = keyUp;

    world.keyDown = world.keyBind.impulse(keyDown);
    world.keyUp = world.keyBind.impulse(keyUp);
}

function World(manifest,callback) {

    this.load = async () => {

        const loadMaps = maps === null;
        const loadTileset = tileset === null;
        const loadManifest = Boolean(manifest);
        const loadPlayer = playerImage === null;

        if(loadMaps || loadMaps || loadTileset || loadPlayer) {

            if(loadManifest) ResourceManager.queueManifest(manifest);
            if(loadTileset) ResourceManager.queueImage(TILESET_NAME + TILESET_FILE_TYPE);
            if(loadMaps) ResourceManager.queueJSON(MAPS_NAME + MAPS_FILE_TYPE);
            if(loadPlayer) ResourceManager.queueImage(PLAYER_SPRITE + PLAYER_SPRITE_FILE_TYPE);

            await ResourceManager.load();

            if(loadTileset) tileset = ResourceManager.getImage(TILESET_NAME);
            if(loadMaps) maps = ResourceManager.getJSON(MAPS_NAME);
            if(loadPlayer) playerImage = ResourceManager.getImage(PLAYER_SPRITE);
        }

        if(callback) callback(this);
    }

    const {managedGamepad, keyBind} = getInputDevices();
    this.managedGamepad = managedGamepad;
    this.keyBind = keyBind;

    const grid = new Grid2D(BASE_TILE_SIZE);
    const camera = grid.camera;
    camera.scale = DEFAULT_CAMERA_SCALE;

    this.grid = grid;
    this.camera = camera;

    this.spriteFollower = new SpriteFollower(camera);
    this.spriteFollower.target = null;
    this.spriteFollower.enabled = false;

    const dispatchRenderer = new DispatchRenderer();
    this.dispatchRenderer = dispatchRenderer;

    this.tileRenderer = null;

    this.lightingLayer = null;
    this.tileCollision = null;
    this.interactionLayer = null;
    this.collisionLayer = null;
    this.spriteLayer = null;

    this.controller = null; this.player = null;
    this.keyDown = null; this.keyUp = null;

    this.addPlayer = sprite => {
        if(!sprite) sprite = getDefaultPlayerSprite();
        if(typeof sprite === "function") sprite = sprite();
        this.player = sprite;
        this.spriteLayer.add(sprite,PLAYER_Z_INDEX);
        this.controller = new Controller(this,sprite);
    };

    grid.bindToFrame(this);
    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };
}

const cache = (world,layerCount,layerStart,isTop,location) => {
    const {grid, tileRenderer, dispatchRenderer} = world;

    const cacheMethod = isTop ? grid.cacheTop : grid.cache;
    grid.renderer = tileRenderer;

    tileRenderer.layerCount = layerCount;
    tileRenderer.layerStart = layerStart;

    if(location) {
        cacheMethod.call(grid,location.x,location.y,1,1);
    } else {
        cacheMethod.call(grid);
    }

    grid.renderer = dispatchRenderer;
};

World.prototype.cacheBackgroundForeground = function(location) {
    cache(this,2,BACKGROUND_LAYER,false,location);
};
World.prototype.cacheSuperForeground = function(location) {
    cache(this,1,SUPER_FOREGROUND_LAYER,true,location);
};

World.prototype.disableSuperForeground = function() {
    this.grid.decacheTop();
};

const updateTileBasedLayers = world => {
    const {grid, tileRenderer, dispatchRenderer} = world;
    world.lightingLayer = new UVTCLighting(
        grid,tileRenderer,LIGHTING_LAYER
    );

    world.tileCollision = new TileCollision(
        grid,tileRenderer,COLLISION_LAYER
    ); //TODO: use custom collisionMaker

    world.interactionLayer = new TileCollision(
        grid,tileRenderer,INTERACTION_LAYER
    );

    world.spriteLayer = new SpriteLayer(world.grid);
    world.collisionLayer = world.spriteLayer.getCollisionLayer();

    dispatchRenderer.clear();

    dispatchRenderer.addUpdate(world.collisionLayer.update);
    dispatchRenderer.addUpdate(world.spriteLayer.update);

    dispatchRenderer.addRender(world.spriteLayer.render);
    if(world.lightingLayer.hasLighting) {
        dispatchRenderer.addRender(world.lightingLayer.render);
    }

};

World.prototype.setMap = function(mapName) {
    this.controller = null;

    const tileRenderer = this.grid.getTileRenderer({
        tileset: tileset,
        setRenderer: false, setSize: true,
        map: maps[mapName],
        uvtcDecoding: true
    });
    tileRenderer.paused = true;
    this.tileRenderer = tileRenderer;

    updateTileBasedLayers(this);

    this.cacheBackgroundForeground();
    this.cacheSuperForeground();
};

World.prototype.getTile = function(layer,x,y) {
    if(!this.tileRenderer) return null;
    return this.tileRenderer.getTile(x,y,layer);
};

World.prototype.setTile = function(layer,x,y,value) {
    if(!this.tileRenderer) return;
    this.tileRenderer.setTile(x,y,value,layer);
    switch(layer) {
        case BACKGROUND_LAYER:
        case FOREGROUND_LAYER:
            this.cacheBackgroundForeground({x,y});
            break;
        case SUPER_FOREGROUND_LAYER:
            this.cacheSuperForeground({x,y});
            break;
        case LIGHTING_LAYER:
            if(this.lightingLayer) this.lightingLayer.refresh();
            break;
        case COLLISION_LAYER:
            if(this.tileCollision) this.tileCollision.reset();
            break;
        case INTERACTION_LAYER:
            if(this.interactionLayer) this.interactionLayer.reset();
            break;
    }
};

World.prototype.getBackgroundTile = function(x,y) {
    return this.getTile(x,y,BACKGROUND_LAYER);
};
World.prototype.setBackgroundTile = function(x,y,value) {
    this.setTile(x,y,value,BACKGROUND_LAYER);
};
World.prototype.getForegroundTile = function(x,y) {
    return this.getTile(x,y,FOREGROUND_LAYER);
};
World.prototype.setForegroundTile = function(x,y,value) {
    this.setTile(x,y,value,FOREGROUND_LAYER);
};
World.prototype.getSuperForegroundTile = function(x,y) {
    return this.getTile(x,y,SUPER_FOREGROUND_LAYER);
};
World.prototype.setSuperForegroundTile = function(x,y,value) {
    this.setTile(x,y,value,SUPER_FOREGROUND_LAYER);
};
World.prototype.getCollisionTile = function(x,y) {
    return this.getTile(x,y,COLLISION_LAYER);
};
World.prototype.setCollisionTile = function(x,y,value) {
    this.setTile(x,y,value,COLLISION_LAYER);
};
World.prototype.getInteractionTile = function(x,y) {
    return this.getTile(x,y,INTERACTION_LAYER);
};
World.prototype.setInteractionTile = function(x,y,value) {
    this.setTile(x,y,value,INTERACTION_LAYER);
};
World.prototype.getLightingTile = function(x,y) {
    return this.getTile(x,y,LIGHTING_LAYER);
};
World.prototype.setLightingTile = function(x,y,value) {
    this.setTile(x,y,value,LIGHTING_LAYER);
};

export default World;

