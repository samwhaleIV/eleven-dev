const {ResourceManager, CanvasManager, Grid2D, SpriteLayer, Frame, GamepadProcessor, KeyBind} = Eleven;

const MAP_NAME = "my_swamp";
const UVTC_TILE_SIZE = 16;

const MOVE_UP = "MoveUp";
const MOVE_LEFT = "MoveLeft";
const MOVE_RIGHT = "MoveRight";
const MOVE_DOWN = "MoveDown";

function TestSprite(grid) {
    this.x = 75;
    this.y = 50;

    this.width = 1;
    this.height = 1;

    this.xDelta = -1;
    this.yDelta = 0;

    this.tilesPerSecond = 5;

    this.update = time => {
        const deltaSecond = time.delta / 1000;
        const speed = this.tilesPerSecond * deltaSecond;

        this.x += this.xDelta * speed;
        this.y += this.yDelta * speed;
    };

    this.render = (context,x,y,width,height) => {
        context.fillStyle = "red";
        context.fillRect(x,y,width,height);
        this.didRender = true;
    };
}

function World() {
    const grid = new Grid2D(UVTC_TILE_SIZE);

    const camera = grid.camera;
    const panZoom = grid.getPanZoom();

    let sprite = null;

    this.load = async () => {
        await ResourceManager.queueManifest(`{
            "Image": ["world-tileset.png"],
            "JSON": ["uvtc-map-data.json"]
        }`).load();

        const maps = ResourceManager.getJSON("uvtc-map-data");
        const tileset = ResourceManager.getImage("world-tileset");

        const tileRenderer = grid.getTileRenderer({
            tileset: tileset,
            setRenderer: true, setSize: true,
            map: maps["my_swamp"],
            uvtcDecoding: true
        });

        tileRenderer.layerCount = 2;
        tileRenderer.layerStart = 0;
        grid.cache();
        tileRenderer.paused = true;

        const spriteLayer = new SpriteLayer(grid);
        spriteLayer.bindToRenderer(tileRenderer);

        tileRenderer.background = (context,{width,height}) => {
            context.fillStyle = sprite.didRender ? "black" : "red";
            context.fillRect(0,0,width,height);
            sprite.didRender = false;
        };

        sprite = new TestSprite(grid);

        spriteLayer.add(sprite);
        spriteLayer.add({
            update: () => {
                grid.alignToPixels(sprite);
                camera.x = sprite.x; camera.y = sprite.y;
            }
        });

        camera.scale = 6;

        camera.center();
        camera.padding = true;
    };

    grid.bindToFrame(this);
    //panZoom.bindToFrame(this);

    this.resize = data => {
        data.context.imageSmoothingEnabled = false;
        grid.resize(data);
    };

    const downKeys = new Object();

    this.keyDown = key => {
        downKeys[key.impulse] = true;
    };
    this.keyUp = key => {
        delete downKeys[key.impulse];
    };

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
    const gamepadProcessor = new GamepadProcessor({
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
    this.inputGamepad = gamepadProcessor.poll;

    const input = downKeys => {
        if(!sprite) return;
        const upDown = MOVE_UP in downKeys;
        const downDown = MOVE_DOWN in downKeys;
        const leftDown = MOVE_LEFT in downKeys;
        const rightDown = MOVE_RIGHT in downKeys;

        let xDelta = 0;
        let yDelta = 0;

        if(upDown) yDelta--;
        if(downDown) yDelta++;
        if(leftDown) xDelta--;
        if(rightDown) xDelta++;

        sprite.xDelta = xDelta;
        sprite.yDelta = yDelta;
    };

    gamepadProcessor.inputGamepad = downKeys => {
        if(sprite.xDelta === 0 && sprite.yDelta === 0) {
            input(downKeys);
        }
    };
    this.input = keyBind.poll(input);

    let lastX = 0;
    //setInterval(()=>{const dif = camera.x-lastX;lastX = camera.x;console.log("x dif",dif)},1000);

    this.grid = grid;
    this.camera = camera;
};
CanvasManager.start({
    frame: World,
    markLoaded: true
});
