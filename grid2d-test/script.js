const {
    ResourceManager,
    CanvasManager,
    AudioManager,
    Grid2D,
    SpriteLayer,
    ManagedGamepad,
    KeyBind,
    SpriteFollower,
    UVTCLighting,
    UVTCReflection,
    DispatchRenderer,
    TileCollision,
    PlayerController,
    InstallHitBox,
    AnimatedSprite,
    TextLayer,
    SpeechBox,
    WorldImpulse
} = Eleven;

const MAP_NAME = "my_swamp";
const UVTC_TILE_SIZE = 16;

const MOVE_UP = "MoveUp";
const MOVE_LEFT = "MoveLeft";
const MOVE_RIGHT = "MoveRight";
const MOVE_DOWN = "MoveDown";
const CLICK = "Enter";

function dispatchMessage(dispatchRenderer,text) {

    const textLayer = new TextLayer({
        text: text,
        lineSpacing: 1,
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

function TestSprite() {
    this.x = 60;
    this.y = 43;

    this.width = 1;
    this.height = 1;

    InstallHitBox(this,12/16,12/16);
    this.yOffset = -(2 / 16);

    this.color = "yellow";

    this.showHitBox = false;

    this.render = (context,x,y,width,height) => {
        context.fillStyle = this.color;
        context.fillRect(x,y,width,height);
    };
}

function World() {
    const grid = new Grid2D(UVTC_TILE_SIZE);
    const camera = grid.camera;

    this.load = async () => {
        await ResourceManager.queueManifest(`{
            "Image": ["world-tileset.png","player.png"],
            "JSON": ["uvtc-map-data.json"]
        }`).load();

        const maps = ResourceManager.getJSON("uvtc-map-data");
        const tileset = ResourceManager.getImage("world-tileset");

        const renderer = grid.getTileRenderer({
            tileset: tileset,
            setRenderer: true, setSize: true,
            map: maps[MAP_NAME],
            uvtcDecoding: true
        });

        renderer.setLayerRange(0,2);
        grid.cache();
        renderer.paused = true;

        const lightingLayer = new UVTCLighting(grid,renderer);
        const tileCollision = new TileCollision(grid,renderer);

        const spriteLayer = new SpriteLayer(grid);
        const collisionLayer = spriteLayer.getCollisionLayer();

        const dispatchRenderer = new DispatchRenderer();

        dispatchRenderer.addUpdate(collisionLayer.update);
        dispatchRenderer.addUpdate(spriteLayer.update);
        dispatchRenderer.addRender(spriteLayer.render);
        if(lightingLayer.hasLighting) {
            dispatchRenderer.addRender(lightingLayer.render);
        }
        const reflector = UVTCReflection.getScrollable(grid,null,null,-0.5);
        dispatchRenderer.addBackground(reflector.clear);
        dispatchRenderer.addResize(reflector.resize);
        dispatchRenderer.addFinalize(reflector.render);

        console.log(dispatchRenderer);

        grid.renderer = dispatchRenderer;

        const sprite = new AnimatedSprite(
            ResourceManager.getImage("player"),60,43
        );

        const spriteFollower = new SpriteFollower(camera,sprite);
        this.spriteFollower = spriteFollower;

        this.sprite = sprite;

        camera.scale = 6;
        camera.center();
        camera.padding = true;

        const playerController = new PlayerController(
            grid,sprite,collisionLayer,tileCollision
        );

        let oldMessage = null;

        const messageBase = dispatchMessage.bind(null,dispatchRenderer);
        const message = async text => {
            playerController.lock();
            oldMessage = messageBase(text);
        };

  
        spriteLayer.add(sprite,1000);
        spriteLayer.add(new (function() {
            this.x = sprite.x - 2;
            this.y = sprite.y;
            this.collides = true;
            this.width = 1; this.height = 1;
            this.impulse = () => {
                message("Who the fuck are you?");
            };
            this.render = (context,x,y,width,height) => {
                context.fillStyle = "red";
                context.fillRect(x,y,width,height);
            };
        })());

        const {managedGamepad, keyBind} = getInputDevices();
        this.inputGamepad = managedGamepad.poll;
                
        const input = playerController.getInputHandler({
            [MOVE_DOWN]: "down", [MOVE_RIGHT]: "right",
            [MOVE_UP]: "up", [MOVE_LEFT]: "left"
        });
        const worldImpulse = new WorldImpulse(sprite,collisionLayer,tileCollision);
        worldImpulse.layerHandler = sprite => {
            if(sprite.impulse) sprite.impulse(worldImpulse.source);
        };
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

        managedGamepad.keyDown = keyDown;
        managedGamepad.keyUp = keyUp;

        this.keyDown = keyBind.impulse(keyDown);
        this.keyUp = keyBind.impulse(keyUp);


        this.playerController = playerController;
    };

    grid.bindToFrame(this);
    

    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };

    this.grid = grid;
};
CanvasManager.start({
    frame: World,
    markLoaded: true
});
