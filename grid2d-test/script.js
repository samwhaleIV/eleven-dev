import TextLayer from "../eleven/engine/modules/uvtc/text/text-layer.js";

const {
    ResourceManager,
    CanvasManager,
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
    InstallHitBox
} = Eleven;

const MAP_NAME = "my_swamp";
const UVTC_TILE_SIZE = 16;

const MOVE_UP = "MoveUp";
const MOVE_LEFT = "MoveLeft";
const MOVE_RIGHT = "MoveRight";
const MOVE_DOWN = "MoveDown";

function getInputDevices() {
    const keyBind = new KeyBind({
        "KeyW": MOVE_UP,
        "KeyS": MOVE_DOWN,
        "KeyA": MOVE_LEFT,
        "KeyD": MOVE_RIGHT,
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
            Right: MOVE_RIGHT
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
            "Image": ["world-tileset.png"],
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

        renderer.layerCount = 2;
        renderer.layerStart = 0;
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

        let sprite = new TestSprite(grid);

        const spriteFollower = new SpriteFollower(camera,sprite);
        this.spriteFollower = spriteFollower;

        this.sprite = sprite;

        camera.scale = 6;
        camera.center();
        camera.padding = true;
  
        spriteLayer.add(sprite);

        const {managedGamepad, keyBind} = getInputDevices();
        this.inputGamepad = managedGamepad.poll;

        const playerController = new PlayerController(
            sprite,collisionLayer,tileCollision
        );
                
        const input = playerController.getInputHandler({
            [MOVE_DOWN]: "down", [MOVE_RIGHT]: "right",
            [MOVE_UP]: "up", [MOVE_LEFT]: "left"
        });
        const keyDown = input.keyDown;
        const keyUp = input.keyUp;

        managedGamepad.keyDown = keyDown;
        managedGamepad.keyUp = keyUp;

        this.keyDown = keyBind.impulse(keyDown);
        this.keyUp = keyBind.impulse(keyUp);

        const textLayer = new TextLayer(["gggggggggggggggggggggggggggg","\n","ABCDEFGHIJKLMNOPQRSTUVWXYZ","\n","Hello,","world!"],700,300,4,1,2);
        dispatchRenderer.addRender((context,{halfWidth,height})=>{
            const x = Math.floor(halfWidth - textLayer.width / 2);
            const y = height - textLayer.height - 10;
            context.fillStyle = "white";
            context.fillRect(x,y,textLayer.width,textLayer.height);
            textLayer.render(context,x,y);
        });
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
