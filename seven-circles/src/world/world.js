import CollisionMaker from "./collision-maker.js";
import GetInputDevices from "./input-devices.js";
import InputCodes from "./input-codes.js";
import WorldMessage from "./world-message.js";
import Constants from "../constants.js";
import GetPlayerSprite from "../avatar/player.js";
import GetNPCSprite from "../avatar/npc.js";

const BASE_TILE_SIZE = 16;
const DEFAULT_CAMERA_SCALE = Constants.DefaultCameraScale;

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

const PLAYER_SPRITE = Constants.PlayerSprite;
const PLAYER_SPRITE_FILE_TYPE = ".png";

const PLAYER_Z_INDEX = Constants.PlayerZIndex;

const {
    CanvasManager,
    ResourceManager,
    Grid2D,
    SpriteLayer,
    SpriteFollower,
    UVTCLighting,
    DispatchRenderer,
    TileCollision,
    PlayerController,
    WorldImpulse
} = Eleven;

let tileset = null;
let maps = null;
let playerImage = null;

function InstallPlayer(world,sprite) {

    const {collisionLayer, tileCollision, interactionLayer} = world;

    const playerController = new PlayerController(
        sprite,collisionLayer,tileCollision
    );

    const input = playerController.getInputHandler({
        [InputCodes.Down]: "down", [InputCodes.Right]: "right",
        [InputCodes.Up]: "up", [InputCodes.Left]: "left"
    });

    const worldImpulse = new WorldImpulse(sprite,collisionLayer,interactionLayer);
    worldImpulse.layerHandler = sprite => {
        if(sprite.impulse) sprite.impulse(worldImpulse.source);
    };
    worldImpulse.tileHandler = tile => {
        if(!world.script || !world.script.interaction) return;
        world.script.interaction(tile);
    };

    world.spriteFollower.target = sprite;
    world.spriteFollower.enabled = true;

    const keyDown = event => {
        if(event.impulse === InputCodes.Click) {
            if(event.repeat) return;
            if(world.canAdvanceMessage()) {
                world.advanceMessage(); return;
            }
            if(!playerController.locked) {
                if(sprite.hasWeapon()) {
                    sprite.attack(); return;
                }
                worldImpulse.impulse();
            }
        } else {
            input.keyDown(event);
        }
    };

    const keyUp = input.keyUp;

    world.managedGamepad.keyDown = keyDown;
    world.managedGamepad.keyUp = keyUp;

    world.keyDown = world.keyBind.impulse(keyDown);
    world.keyUp = world.keyBind.impulse(keyUp);

    return playerController;
}

function World(callback) {

    this.load = async () => {

        const loadMaps = maps === null;
        const loadTileset = tileset === null;

        const loadPlayer = playerImage === null;

        if(loadMaps || loadTileset || loadPlayer) {

            if(loadTileset) ResourceManager.queueImage(TILESET_NAME + TILESET_FILE_TYPE);
            if(loadMaps) ResourceManager.queueJSON(MAPS_NAME + MAPS_FILE_TYPE);
            if(loadPlayer) ResourceManager.queueImage(PLAYER_SPRITE + PLAYER_SPRITE_FILE_TYPE);

            await ResourceManager.load();

            if(loadTileset) tileset = ResourceManager.getImage(TILESET_NAME);
            if(loadMaps) maps = ResourceManager.getJSON(MAPS_NAME);
            if(loadPlayer) playerImage = ResourceManager.getImage(PLAYER_SPRITE);
        }

        if(callback) await callback(this);
    }

    Object.defineProperties(this,{
        tileset: {
            get: () => tileset,
            enumerable: true
        },
        playerImage: {
            get: () => playerImage,
            enumerable: true
        }
    });

    const {managedGamepad, keyBind} = GetInputDevices();
    this.inputGamepad = managedGamepad.poll;

    this.managedGamepad = managedGamepad;
    this.keyBind = keyBind;

    const grid = new Grid2D(BASE_TILE_SIZE);
    const camera = grid.camera;

    this.grid = grid;
    this.camera = camera;

    this.spriteFollower = new SpriteFollower(camera);
    this.spriteFollower.target = null;
    this.spriteFollower.enabled = false;

    this.script = null;

    const dispatchRenderer = new DispatchRenderer();
    this.dispatchRenderer = dispatchRenderer;

    this.tileRenderer = null;

    this.lightingLayer = null;
    this.tileCollision = null;
    this.interactionLayer = null;
    this.collisionLayer = null;
    this.spriteLayer = null;

    this.playerController = null; this.player = null;
    this.keyDown = null; this.keyUp = null;

    this.textMessage = null;
    this.textMessageStack = new Array();

    grid.bindToFrame(this);
    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };
}

const resolveStack = new Array();

World.prototype.showMessage = function(message,instant) {
    if(this.canAdvanceMessage()) {
        this.textMessageStack.push([message,instant]);
    } else {
        this.textMessage = new WorldMessage(this.dispatchRenderer,message,instant);
    }
    return new Promise(resolve => {
        resolveStack.push(resolve);
    });
}
World.prototype.showMessageInstant = function(message) {
    return this.showMessage(message,true);
}
World.prototype.canAdvanceMessage = function() {
    return Boolean(this.textMessage);
}
World.prototype.advanceMessage = function() {
    if(this.canAdvanceMessage()) {
        if(this.textMessage.complete) {
            this.textMessage.terminate();
            this.textMessage = null;
            if(this.textMessageStack.length >= 1) {
                const newMessage = this.textMessageStack.shift();
                this.showMessage.apply(this,newMessage);
            } else {
                resolveStack.forEach(resolve=>resolve());
                resolveStack.splice(0);
            }
        } else {
            this.textMessage.advance();
        }
    }
}

World.prototype.addCustomPlayer = function(sprite,...parameters) {
    if(typeof sprite === "function") {
        sprite = new sprite(...parameters);
    }
    this.spriteLayer.add(sprite,PLAYER_Z_INDEX);
    this.playerController = InstallPlayer(this,sprite);
    this.player = sprite;
    return sprite;
}

World.prototype.addPlayer = function(...parameters) {
    const sprite = GetPlayerSprite.apply(this,parameters);
    return this.addCustomPlayer(sprite);
}
World.prototype.addNPC = function(...parameters) {
    const NPC = GetNPCSprite.apply(this,parameters);
    this.spriteLayer.add(NPC);
    return NPC;
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
        grid,tileRenderer,COLLISION_LAYER,CollisionMaker
    );

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

const hasSuperForeground = tileRenderer => {
    const superForeground = tileRenderer.readLayer(SUPER_FOREGROUND_LAYER);

    for(let i = 0;i<superForeground.length;i++) {
        if(superForeground[i] >= 1) return true;
    }
    return false;
};

World.prototype.runScript = async function(script) {
    const processPauseSequencing = CanvasManager.frame && !CanvasManager.paused;

    if(processPauseSequencing) {
        CanvasManager.markLoading();
        CanvasManager.paused = true;
    }

    if(this.script && this.script.unload) this.script.unload();
    this.script = null;
    if(typeof script === "function") script = new script(this);
    this.script = script;
    if(script.load) await script.load();

    if(processPauseSequencing) {
        CanvasManager.markLoaded();
        CanvasManager.paused = false;
    }
}

World.prototype.setMap = function(mapName) {
    this.player = null;
    this.playerController = null;

    this.spriteFollower.target = null;
    this.spriteFollower.enabled = false;
    this.textMessage = null;
    this.textMessageStack.splice(0);

    this.grid.decache();
    this.grid.decacheTop();

    this.camera.reset();
    this.camera.scale = DEFAULT_CAMERA_SCALE;

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

    if(hasSuperForeground(tileRenderer)) {
        this.cacheSuperForeground();
    }
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
