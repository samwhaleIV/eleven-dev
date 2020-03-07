const {
    ResourceManager,
    CanvasManager,
    Grid2D,
    SpriteLayer,
    Frame,
    ManagedGamepad,
    KeyBind,
    SpriteFollower,
    UVTCLighting,
    UVTCReflection,
    DispatchRenderer,
    CollisionLayer,
    UVTCCollision
} = Eleven;

const MAP_NAME = "my_swamp";
const UVTC_TILE_SIZE = 16;

const MOVE_UP = "MoveUp";
const MOVE_LEFT = "MoveLeft";
const MOVE_RIGHT = "MoveRight";
const MOVE_DOWN = "MoveDown";

function TestSprite() {
    this.x = 60.5;
    this.y = 43;

    this.width = 4; this.height = 0.25;

    this.xDelta = 0; this.yDelta = 0;

    this.tilesPerSecond = 5;

    this.color = "red";

    this.update = time => {
        const deltaSecond = time.delta / 1000;
        const speed = this.tilesPerSecond * deltaSecond;

        this.x += this.xDelta * speed;
        this.y += this.yDelta * speed;
    };

    this.render = (context,x,y,width,height) => {
        context.fillStyle = this.color;
        context.fillRect(x,y,width,height);
    };
}

function World() {
    const grid = new Grid2D(UVTC_TILE_SIZE);
    const camera = grid.camera;
    let sprite = null;

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

        sprite = new TestSprite(grid);

        const spriteFollower = new SpriteFollower(camera,sprite);
        this.spriteFollower = spriteFollower;
        this.spriteFollower.disable();
        this.sprite = sprite;

        camera.scale = 6;
        camera.center();
        camera.padding = true;

        const sprite2 = new TestSprite();
        sprite2.color = "green";
        sprite2.x -= 5;
        spriteLayer.add(sprite2);

        sprite2.collides = true;
        sprite.collides = false;

        const collider = collisionLayer.collides;
        const tileCollider = new UVTCCollision(grid,renderer).collides;
        collisionLayer.collides = sprite => {
            let result = collider(sprite);
            if(!result) result = tileCollider(sprite);
            return result;
        };

        sprite.update = (function(time) {
            const deltaSecond = time.delta / 1000;
            const speed = this.tilesPerSecond * deltaSecond;
            if(this.xDelta) {
                this.x += this.xDelta * speed;
                const goingDown = this.xDelta < 0
                const collisionResult = collisionLayer.collides(sprite);
                if(collisionResult) {
                    if(goingDown) {
                        //going left
                        this.x = collisionResult.x + collisionResult.width;
                    } else {
                        //going right
                        this.x = collisionResult.x - this.width;
                    }
                }
            } else if(this.yDelta) {
                this.y += this.yDelta * speed;
                const goingDown = this.yDelta < 0;
                const collisionResult = collisionLayer.collides(sprite);
                if(collisionResult) {
                    if(goingDown) {
                        //going up
                        this.y = collisionResult.y + collisionResult.height;
                    } else {
                        //going down
                        this.y = collisionResult.y - this.height;
                    }
                }
            }
        }).bind(sprite);

        sprite.width = 0.75;
        sprite.height = 0.75;

        const sprite3 = new TestSprite();
        sprite3.color = "green";
        sprite3.x -= 5;
        sprite3.y += 1.25;
        sprite3.width = 0.25;
        sprite3.height = 10;
        sprite3.collides = true;
        sprite3.x += 0.25;
        spriteLayer.add(sprite3);

        spriteLayer.add(sprite);

        dispatchRenderer.addUpdate(()=>{
            if(collisionLayer.collides(sprite)) {
                sprite.color = "blue";
            } else {
                sprite.color = "red";
            }
        });
    };

    grid.bindToFrame(this);

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
    this.inputGamepad = managedGamepad.poll;

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

    managedGamepad.inputGamepad = downKeys => {
        if(sprite.xDelta === 0 && sprite.yDelta === 0) {
            input(downKeys);
        }
    };
    this.input = keyBind.poll(input);

    this.grid = grid;
    this.camera = camera;

    grid.getPanZoom().bindToFrame(this);
};
CanvasManager.start({
    frame: World,
    markLoaded: true
});
