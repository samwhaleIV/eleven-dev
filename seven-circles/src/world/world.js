import CollisionMaker from "./collision-maker.js";
import InputCodes from "../user-interface/input-codes.js";
import WorldMessage from "./world-message.js";
import Constants from "../constants.js";
import GetPlayerSprite from "../avatar/player.js";
import GetNPCSprite from "../avatar/npc.js";
import InstallSpatialSound from "./spatial-sound.js";
import ScriptBook from "../scripts/script-book.js";
import ZIndexBook from "./z-indices.js";
import ParticleSprite from "./particle-sprite.js";
import ItemUseTable from "../items/item-use-table.js";
import FadeTransition from "../scripts/helper/fade-transition.js";
import ItemNotification from "./item-notification.js";

const BASE_TILE_SIZE = 16;
const DEFAULT_CAMERA_SCALE = Constants.DefaultCameraScale;

const BACKGROUND_LAYER = 0;
const FOREGROUND_LAYER = 1;
const SUPER_FOREGROUND_LAYER = 2;
const COLLISION_LAYER = 3;
const INTERACTION_LAYER = 4;
const LIGHTING_LAYER = 5;
const FADER_DURATION = 5000;

const TRIGGER_TILES = Constants.TriggerTiles;

const TILESET_NAME = "world-tileset";
const MAPS_NAME = "maps";
const PLAYER_SPRITE = Constants.PlayerSprite;

const DID_NOTHING = "This item doesn't want to do anything right now.";
const BAD_ITEM_PLACMEMENT = "The item doesn't want to go here!";

const FOR_SCRIPT_PARSE_ONLY = () => {
    throw Error("This method is only for use during the initial script sequencing!");
};
const VALIDATE_PARSE_ONLY_METHOD = world => {
    if(world.pendingScriptData === null) FOR_SCRIPT_PARSE_ONLY(); 
};

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
    WorldImpulse,
    TextSprite,
    Fader,Faders,
    TileSprite,
    CollisionTypes
} = Eleven;

let tileset = null;
let maps = null;
let playerImage = null;

function InstallPlayer(world,sprite) {

    const {collisionLayer, tileCollision, interactionLayer} = world;

    const playerController = new PlayerController(
        sprite,collisionLayer,tileCollision
    );
    playerController.triggerHandler = sprite => {
        const {script} = world; if(!script) return;
        const {trigger,noTrigger} = script;
        if(!trigger && !noTrigger) return;

        const result = interactionLayer.collides(sprite);

        if(!result || result.value > TRIGGER_TILES) {
            if(noTrigger) noTrigger();
        } else {
            if(trigger) trigger(result.value);
        }
    };

    const input = playerController.getInputHandler({
        [InputCodes.Down]: "down", [InputCodes.Right]: "right",
        [InputCodes.Up]: "up", [InputCodes.Left]: "left"
    });
    world.refreshInput = input.refresh;

    const {Inventory} = SVCC.Runtime;

    const playerImpulse = new WorldImpulse(sprite,collisionLayer,interactionLayer);
    playerImpulse.layerHandler = sprite => {
        if(sprite.impulse) {
            const impulseData = {
                source: playerImpulse.source,
                world,script: world.script,
                self: sprite, inventory: Inventory
            };
            sprite.impulse(impulseData);
        }
    };
    playerImpulse.tileHandler = tile => {
        if(tile <= TRIGGER_TILES) return;
        if(!world.script || !world.script.interact) return;
        world.script.interact(tile);
    };
    world.playerImpulse = playerImpulse;

    world.spriteFollower.target = sprite;
    world.spriteFollower.enabled = true;

    const keyUp = input.keyUp;
    const keyDown = event => {
        if(event.impulse === InputCodes.Inventory) {
            if(event.repeat) return;
            if(playerController.locked) {
                if(!world.canAdvanceMessage()) return;
                world.advanceMessage();
            } else {
                Inventory.show();
            }
        } else if(event.impulse === InputCodes.Click) {
            if(event.repeat) return;
            if(world.canAdvanceMessage()) {
                world.advanceMessage();
            } else if(!playerController.locked) {
                if(sprite.hasWeapon()) {
                    sprite.attack(); return;
                }
                playerImpulse.impulse();
            }
        } else {
            input.keyDown(event);
        }
    };

    world.inputGamepad = world.managedGamepad.poll;
    world.managedGamepad.keyDown = keyDown;
    world.managedGamepad.keyUp = keyUp;

    world.keyDown = world.keyBind.impulse(keyDown);
    world.keyUp = world.keyBind.impulse(keyUp);

    return playerController;
}

function FaderList(dispatchRenderer) {
    const faders = new Object();
    this.add = fader => {
        const ID = dispatchRenderer.addFinalize(
            fader.render,ZIndexBook.Fader
        );
        fader.ID = ID; faders[ID] = fader;
        return fader;
    };
    this.remove = ID => {
        if(typeof ID === "string") ID = Number(ID);
        dispatchRenderer.removeFinalize(ID);
        delete faders[ID];
    };
    this.clear = () => {
        Object.keys(faders).forEach(this.remove);
    };
    this.list = () => {
        return Object.values(faders);
    };
    this.reload = () => {
        Object.entries(faders).forEach(([oldID,fader])=>{
            delete faders[oldID]; this.add(fader);
        });
    };
    this.pop = () => {
        const faderList = Object.keys(faders);
        if(!faderList.length) return;
        this.remove(faderList[faderList.length-1]);
    };
}

let messageLock = false;
const resolveStack = new Array();

function World(callback) {

    messageLock = false;
    resolveStack.splice(0);

    this.tilesetColumns = 0;
    this.tileSize = BASE_TILE_SIZE;

    this.load = async () => {

        tileset = ResourceManager.getImage(TILESET_NAME);
        this.tilesetColumns = tileset.width / BASE_TILE_SIZE;

        maps = ResourceManager.getJSON(MAPS_NAME);
        playerImage = ResourceManager.getImage(PLAYER_SPRITE);

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

    const {InputServer} = SVCC.Runtime;
    const managedGamepad = InputServer.managedGamepad;
    const {keyBind} = InputServer;

    this.inputGamepad = managedGamepad.poll;

    this.managedGamepad = managedGamepad;
    this.keyBind = keyBind;

    const grid = new Grid2D(BASE_TILE_SIZE);
    const camera = grid.camera;

    this.grid = grid;
    this.camera = camera;

    this.spriteFollower = new SpriteFollower(camera,null,false);

    this.script = null;

    const dispatchRenderer = new DispatchRenderer();
    this.dispatchRenderer = dispatchRenderer;
    const faderList = new FaderList(dispatchRenderer);
    this.faderList = faderList;
    this.clearFaders = faderList.clear;
    this.popFader = faderList.pop;

    this.tileRenderer = null;

    this.lightingLayer = null;
    this.tileCollision = null;
    this.interactionLayer = null;
    this.collisionLayer = null;
    this.spriteLayer = null;
    this.highSpriteLayer = null;
    this.pendingScriptData = null;

    this.playerController = null; this.player = null;
    this.playerImpulse = null;
    this.keyDown = null; this.keyUp = null;

    this.textMessage = null;
    this.textMessageStack = new Array();

    this.refreshInput = null;

    this.collisionChangePending = false;
    this.interactionChangePending = false;
    this.lightingChangePending = false;

    grid.bindToFrame(this);
    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };
}

function showMessage(message,instant,lock) {
    const canLock = !messageLock && this.playerController && lock;
    if(canLock) {
        messageLock = true;
        this.playerController.lock();
    }
    if(this.canAdvanceMessage()) {
        this.textMessageStack.push([message,instant]);
    } else {
        this.textMessage = new WorldMessage(this.dispatchRenderer,message,instant);
    }
    return new Promise(resolve => {
        resolveStack.push(resolve);
    });
}
World.prototype.say = async function(message) {
    return showMessage.call(this,message,false,true);
}
World.prototype.sayUnlocked = function(message) {
    return showMessage.call(this,message,false,false);
}
World.prototype.message = function(message) {
    return showMessage.call(this,message,true,true);
}
World.prototype.messageUnlocked = function(message) {
    return showMessage.call(this,message,true,false);
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
                showMessage.apply(this,newMessage);
            } else {
                resolveStack.forEach(resolve=>resolve());
                resolveStack.splice(0);
                if(messageLock && this.playerController) {
                    this.playerController.unlock();
                }
                messageLock = false;
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
    this.spriteLayer.add(sprite,ZIndexBook.Player);
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
    this.spriteLayer.add(NPC,ZIndexBook.NPC);
    return NPC;
}
World.prototype.getTextureXY = function(tileID,premultiply=true) {
    let textureColumn = tileID % this.tilesetColumns;
    let textureRow = Math.floor(tileID / this.tilesetColumns);
    if(premultiply) {
        textureColumn *= this.tileSize;
        textureRow *= this.tileSize;
    }
    return [textureColumn,textureRow];
}
World.prototype.addTileSprite = function(x,y,tileID,collides) {
    const tileSize = BASE_TILE_SIZE;
    const [textureColumn,textureRow] = this.getTextureXY(tileID,false);

    const tileSprite = new TileSprite(
        x,y,this.tileset,textureColumn,textureRow,tileSize
    );

    if(collides) {
        tileSprite.collides = true;
        tileSprite.collisionType = CollisionTypes.Default;
    }

    this.spriteLayer.add(tileSprite,ZIndexBook.TileSprite);
    return tileSprite;
}
const safeSummonPosition = value => Math.round(value * 16) / 16;

World.prototype.summonSprite = function(sprite) {
    const {direction, hitBox} = this.player;

    const extraDistance = 1 / 32;

    let x, y;

    switch(direction) {
        case 0: //up
        case 2: //down
            x = hitBox.x + hitBox.width / 2 - sprite.width / 2;
            if(direction === 0) {
                y = hitBox.y - sprite.height - extraDistance;
            } else {
                y = hitBox.y + hitBox.height + extraDistance;
            }
            break;
        case 1: //right
        case 3: //left
            y = hitBox.y + hitBox.height / 2 - sprite.height / 2;
            if(direction === 3) {
                x = hitBox.x - sprite.width - extraDistance;
            } else {
                x = hitBox.x + hitBox.width + extraDistance;
            }
            break;
    }

    sprite.x = safeSummonPosition(x);
    sprite.y = safeSummonPosition(y);

    const collides = this.collisionLayer.collides(sprite) || this.tileCollision.collides(sprite);
    if(collides) this.spriteLayer.remove(sprite.ID);

    return !collides;
}

const cache = (world,layerCount,layerStart,isTop,location) => {
    const {grid, tileRenderer, dispatchRenderer} = world;

    const cacheMethod = isTop ? grid.cacheTop : grid.cache;
    grid.renderer = tileRenderer;

    tileRenderer.setLayerRange(layerStart,layerCount);

    if(location) {
        cacheMethod.call(grid,location.x,location.y,1,1);
    } else {
        cacheMethod.call(grid);
    }

    grid.renderer = dispatchRenderer;
};

World.prototype.cacheBackgroundForeground = function(location) {
    cache(this,2,BACKGROUND_LAYER,false,location);
}
World.prototype.cacheSuperForeground = function(location) {
    cache(this,1,SUPER_FOREGROUND_LAYER,true,location);
}

World.prototype.disableSuperForeground = function() {
    this.grid.decacheTop();
}

const updateTileBasedLayers = world => {
    const {grid, tileRenderer, dispatchRenderer} = world;

    world.lightingChangePending = false;
    world.collisionChangePending = false;
    world.interactionChangePending = false;

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
    world.highSpriteLayer = new SpriteLayer(world.grid);
    world.collisionLayer = world.spriteLayer.getCollisionLayer();

    dispatchRenderer.clear();

    dispatchRenderer.addUpdate(world.collisionLayer.update);
    dispatchRenderer.addUpdate(world.spriteLayer.update);

    dispatchRenderer.addRender(world.spriteLayer.render);
    if(world.lightingLayer.hasLighting) {
        dispatchRenderer.addRender(world.lightingLayer.render);
    }

    const highSpriteZIndex = ZIndexBook.HighSpriteLayer;
    dispatchRenderer.addFinalize(
        world.highSpriteLayer.update,highSpriteZIndex
    );
    dispatchRenderer.addFinalize(
        world.highSpriteLayer.render,highSpriteZIndex
    );

};

const hasSuperForeground = tileRenderer => {
    const superForeground = tileRenderer.readLayer(SUPER_FOREGROUND_LAYER);

    for(let i = 0;i<superForeground.length;i++) {
        if(superForeground[i] >= 1) return true;
    }
    return false;
};

World.prototype.unloadScript = function() {
    if(this.script && this.script.unload) this.script.unload();
    this.script = null;
}

World.prototype.runScript = async function(script,data,runStartScript=true) {
    if(!data) data = new Object();

    if(this.script) {
        data.lastScript = this.script.constructor.name;
    } else {
        data.lastScript = null;
    }

    if(data.fromFade && this.playerController) {
        this.inputCopyState = this.playerController.getInputHandler().copyState();
    }

    if(typeof script === "string") {
        script = ScriptBook.Get(script);
    }

    const processPauseSequencing = CanvasManager.frame && !CanvasManager.paused;

    if(processPauseSequencing) {
        CanvasManager.markLoading();
        CanvasManager.paused = true;
    }

    this.unloadScript();

    //This is so the script lifetime can figure out what script called the lifetime request
    this.script = script;

    this.pendingScriptData = new Object();

    const {Inventory,SaveState} = SVCC.Runtime;
    data.inventory = Inventory;
    data.saveState = SaveState;
    data.world = this;
    data.transition = (script,data,fadeTime) => {
        FadeTransition(this,script,data,fadeTime);
    };

    script = new script(data); this.script = script;
    if(this.playerController) this.playerController.lock();

    if(this.pendingScriptData !== null) {
        Object.assign(this.script,this.pendingScriptData);
        this.pendingScriptData = null;
    }

    if(script.load) await script.load();

    this.pushTileChanges(); this.dispatchRenderer.resize();

    if(processPauseSequencing) {
        CanvasManager.markLoaded();
        CanvasManager.paused = false;
    }

    if(this.inputCopyState && this.playerController) {
        this.playerController.getInputHandler().setState(this.inputCopyState);
    }
    Object.values(CanvasManager.downKeys).forEach(key => {
        const proxyEvent = Object.assign({},key); proxyEvent.repeat = false;
        this.keyDown(proxyEvent);
    });

    this.inputCopyState = null;

    if(runStartScript) {
        let startLocked = false;
        if(script.start) {
            startLocked = script.start();
        }
        if(!startLocked && this.playerController) {
            this.playerController.unlock();
        }
    }
}

World.prototype.setMap = function(mapName) {
    this.player = null;
    this.playerController = null;
    this.playerImpulse = null;

    this.refreshInput = null;
    this.managedGamepad.keyDown = null;
    this.managedGamepad.keyUp = null;
    this.keyDown = null;
    this.keyUp = null;

    this.spriteFollower.reset();
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
        uvtcDecoding: true,
        fillEmpty: true
    });
    tileRenderer.paused = true;
    this.tileRenderer = tileRenderer;

    updateTileBasedLayers(this);

    this.cacheBackgroundForeground();

    if(hasSuperForeground(tileRenderer)) {
        this.cacheSuperForeground();
    }

    this.faderList.reload();
}

World.prototype.getTile = function(layer,x,y) {
    if(!this.tileRenderer) return null;
    return this.tileRenderer.getTile(x,y,layer);
}

const batchedLayers = {
    [LIGHTING_LAYER]: true,
    [COLLISION_LAYER]: true,
    [INTERACTION_LAYER]: true
};

World.prototype.setTile = function(layer,x,y,value) {
    if(!this.tileRenderer) return;
    this.tileRenderer.setTile(x,y,value,layer);
    if(batchedLayers[layer]) return;
    switch(layer) {
        case BACKGROUND_LAYER:
        case FOREGROUND_LAYER:
            this.cacheBackgroundForeground({x,y});
            break;
        case SUPER_FOREGROUND_LAYER:
            this.cacheSuperForeground({x,y});
            break;
    }
}
World.prototype.setCollisionTile = function(x,y,value) {
    this.setTile(COLLISION_LAYER,x,y,value);
    this.collisionChangePending = true;
}
World.prototype.setInteractionTile = function(x,y,value) {
    this.setTile(INTERACTION_LAYER,x,y,value);
    this.interactionChangePending = true;
}
World.prototype.setLightingTile = function(x,y,value) {
    this.setTile(LIGHTING_LAYER,x,y,value);
    this.lightingChangePending = true;
}
World.prototype.pushCollisionChanges = function() {
    if(!this.collisionChangePending) return;

    this.tileCollision.reset();
    this.collisionChangePending = false;
    if(DEV) console.log("World performance: Tile collision layer reset!");
}
World.prototype.pushInteractionChanges = function() {
    if(!this.interactionChangePending) return;

    this.interactionLayer.reset();
    this.interactionChangePending = false;
    if(DEV) console.log("World performance: Tile interaction layer reset!");
}
World.prototype.pushLightingChanges = function() {
    if(!this.lightingChangePending) return;

    this.lightingLayer.refresh();
    this.lightingChangePending = false;
    if(DEV) console.log("World performance: Tile lighting layer refreshed!");
}
World.prototype.pushTileChanges = function() {
    this.pushCollisionChanges();
    this.pushInteractionChanges();
    this.pushLightingChanges();
}
World.prototype.getBackgroundTile = function(x,y) {
    return this.getTile(BACKGROUND_LAYER,x,y);
}
World.prototype.setBackgroundTile = function(x,y,value) {
    this.setTile(BACKGROUND_LAYER,x,y,value);
}
World.prototype.getForegroundTile = function(x,y) {
    return this.getTile(FOREGROUND_LAYER,x,y);
}
World.prototype.setForegroundTile = function(x,y,value) {
    this.setTile(FOREGROUND_LAYER,x,y,value);
}
World.prototype.getSuperForegroundTile = function(x,y) {
    return this.getTile(SUPER_FOREGROUND_LAYER,x,y);
}
World.prototype.setSuperForegroundTile = function(x,y,value) {
    this.setTile(SUPER_FOREGROUND_LAYER,x,y,value);
}
World.prototype.getCollisionTile = function(x,y) {
    return this.getTile(COLLISION_LAYER,x,y);
}
World.prototype.getInteractionTile = function(x,y) {
    return this.getTile(INTERACTION_LAYER,x,y);
}
World.prototype.getLightingTile = function(x,y) {
    return this.getTile(LIGHTING_LAYER,x,y);
}
World.prototype.addTextSprite = function(data) {
    if(data.center) {
        if(!isNaN(data.x)) data.x += 0.5;
        if(!isNaN(data.y)) data.y += 0.5;
    }
    data.grid = this.grid;
    const textSprite = new TextSprite(data);
    this.highSpriteLayer.add(textSprite,ZIndexBook.TextSprite);
    return textSprite;
}
function addParticles(x,y,emitter,target,size) {
    const particleSprite = new ParticleSprite(
        x,y,emitter,target,this,size
    );
    const ID = this.highSpriteLayer.add(
        particleSprite,ZIndexBook.ParticleSprite
    );
    particleSprite.ID = ID; return particleSprite;
}
World.prototype.addParticles = function(x,y,emitter,size) {
    return addParticles.call(this,x,y,emitter,null,size);
}
World.prototype.addTrackedParticles = function(target,emitter,size) {
    return addParticles.call(this,null,null,emitter,target,size);
}
World.prototype.removeParticles = function(particleSprite) {
    const ID = typeof particleSprite === "number" ? particleSprite : particleSprite.ID;
    this.highSpriteLayer.remove(ID);
}

World.prototype.addFader = function(renderer) {
    return this.faderList.add(new Fader(renderer));
}
World.prototype.blackFader = function() {
    return this.addFader(Faders.Black);
}
World.prototype.whiteFader = function() {
    return this.addFader(Faders.White);
}
World.prototype.removeFader = function(fader) {
    const ID = typeof fader === "number" ? fader : fader.ID;
    this.faderList.remove(ID);
}
World.prototype.fade = function(renderer,duration,fadeTo) {
    if(isNaN(duration)) duration = FADER_DURATION;
    return new Promise(resolve => {
        const fader = this.addFader(renderer);
        const didStart = fader.start({
            polarity: Boolean(fadeTo),
            duration, callback: resolve
        });
        if(!didStart) resolve();
    });
}
World.prototype.fadeFrom = function(renderer,duration) {
    return this.fade(renderer,duration,false);
}
World.prototype.fadeTo = function(renderer,duration) {
    return this.fade(renderer,duration,true);
}
World.prototype.fadeToBlack = function(duration) {
    return this.fadeTo(Faders.Black,duration);
}
World.prototype.fadeToWhite = async function(duration) {
    return this.fadeTo(Faders.White,duration);
}
World.prototype.fadeFromBlack = async function(duration) {
    return this.fadeFrom(Faders.Black,duration);
}
World.prototype.fadeFromWhite = async function(duration) {
    return this.fadeFrom(Faders.White,duration);
}
World.prototype.setTriggerHandlers = function(triggerSet) {
    VALIDATE_PARSE_ONLY_METHOD(this);

    const worldTriggerSet = new Object();

    triggerSet.forEach(trigger=>{
        if(!trigger) return;
        const [ID,handler,fireOnce=false] = trigger;
        worldTriggerSet[ID] = {fireOnce,handler,fired:false};
    });

    let activeTrigger = null;

    const sendTrigger = ID => {
        const triggerData = worldTriggerSet[ID];
        if(!triggerData || (triggerData.fireOnce && triggerData.fired)) return;
        triggerData.handler(!triggerData.fired);
        triggerData.fired = true;
    };

    const trigger = ID => {
        if(activeTrigger === null || activeTrigger !== ID) {
            sendTrigger(ID); activeTrigger = ID;
        }
    };
    const noTrigger = () => {
        activeTrigger = null;
    };

    Object.assign(this.pendingScriptData,{trigger,noTrigger});
}
World.prototype.useItem = function(safeID,removeItem,message) {
    const {Inventory} = SVCC.Runtime;

    if(removeItem) Inventory.removeItem(safeID);

    if(message) this.message(message);

    return true;
}
World.prototype.sendPlayerBasedAction = function(target) {
    return target({script:this.script,world:this,player:this.player});
}
World.prototype.itemHandler = function(safeID) {
    if(!(safeID in ItemUseTable)) return false;
    const summonData = ItemUseTable[safeID];
    if(!summonData) return false;

    const {
        tileID, action, spriteData, retain, verifyPlacement
    } = summonData;

    let canPlace = true;
    if(verifyPlacement) canPlace = verifyPlacement(this.script,this);

    if((isNaN(tileID) || !canPlace) && action) {
        if(action) {
            const wasAbleToUse = this.sendPlayerBasedAction(action);
            if(wasAbleToUse) {
                return this.useItem(safeID,!Boolean(retain));
            } else {
                return this.useItem(safeID,false,DID_NOTHING);
            }
        } else {
            return false;
        }
    }

    const sprite = this.addTileSprite(0,0,tileID,true);
    const didSummon = this.summonSprite(sprite);

    if(didSummon) {
        if(spriteData) {
            let newData = spriteData;
            if(typeof spriteData === "function") newData = spriteData();
            Object.assign(sprite,newData);
        }
        if(action) this.sendPlayerBasedAction(action);
        return this.useItem(safeID,!Boolean(retain));
    } else {
        return this.useItem(safeID,false,BAD_ITEM_PLACMEMENT);
    }
}
World.prototype.itemNotification = function(itemName,amount) {
    if(this.script.dontNotifyItems) return;
    ItemNotification(this,itemName,amount);
}
InstallSpatialSound(World.prototype);

export default World;
