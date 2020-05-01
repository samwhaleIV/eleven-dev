const BOMB_PLACEMENT_ID = 51;
const BOMB_DESTRUCTION_ID = 50;

const BOMB_TILE_ID = 199;
const EXPLOSION_DELAY = 2000;
const JITTER_AMOUNT = 0.01;

const {ParticleSystem} = Eleven;

const DESTRUCTION_TILES = {
    266: 517,
    267: 518
};

const DESTRUCTION_MATRIX = [
    [-1,-1],[0, -1],[1,-1],
    [-1, 0],        [1, 0],
    [-1, 1],[0,  1],[1, 1]
];

const POOL_COUNT = 3;
const PARTICLE_BASE = ParticleSystem.getType("Base",{
    duration: 200,
    color: (() => {
        let colorIndex = 0;
        const colors = ["#FF5200","#FF0000","#FF7C00"];
        return () => colors[colorIndex++ % colors.length];
    })(),
    scale: t => 1 + t,
    size: 24,
    count: 12,
    xv: 800,
    yv: 800
});

function endOfExplosion(world,tileSprite,callback) {
    world.spriteLayer.remove(tileSprite.ID);

    const pool = ParticleSystem.getPool(PARTICLE_BASE,POOL_COUNT);
    const particleSprite = world.addTrackedParticles(tileSprite,pool);

    callback();
    
    pool.fire(()=>{
        world.removeParticles(particleSprite);
    });
}

function getEndOfExplosion(world,tileSprite,callback) {
    return endOfExplosion.bind(null,world,tileSprite,callback);
}

function addBomb(world,x,y,callback) {
    const tileSprite = world.addTileSprite(x,y,BOMB_TILE_ID,false);
    const {render} = tileSprite;

    tileSprite.render = (context,x,y,width,height) => {
        context.save();

        const xJitter = width * JITTER_AMOUNT, yJitter = height * JITTER_AMOUNT;

        context.translate(Math.random()*xJitter*2-xJitter,Math.random()*yJitter*2-yJitter);

        render(context,x,y,width,height);
        context.restore();
    };

    setTimeout(getEndOfExplosion(world,tileSprite,callback),EXPLOSION_DELAY);
}

function InstallBombAreas(world,script) {

    const {tileRenderer} = world;

    tileRenderer.readLayer(4).forEach((value,idx)=>{
        if(value === BOMB_DESTRUCTION_ID) {
            const [x,y] = tileRenderer.getXY(idx);
            world.setCollisionTile(x,y,1);
        }
    });

    const clearInteraction = destructionTiles => {
        for(let i = 0;i<destructionTiles.length;i++) {

            const [x,y] = destructionTiles[i];

            for(let m = 0;m<DESTRUCTION_MATRIX.length;m++) {

                const [xm,ym] = DESTRUCTION_MATRIX[m];
                const xt = xm + x, yt = ym + y;

                if(world.getInteractionTile(xt,yt) !== BOMB_PLACEMENT_ID) continue;

                world.setInteractionTile(xt,yt,0);
            }
        }
        world.pushInteractionChanges();
    };

    const getDestructionTiles = (x,y) => {
        const tiles = [];
        for(let m = 0;m<DESTRUCTION_MATRIX.length;m++) {
    
            const [xm,ym] = DESTRUCTION_MATRIX[m];
            const xt = xm + x, yt = ym + y;

            const tile = world.getInteractionTile(xt,yt);

            if(tile === BOMB_DESTRUCTION_ID) {
                let displayTile = world.getForegroundTile(xt,yt);
                if(displayTile in DESTRUCTION_TILES) {
                    displayTile = DESTRUCTION_TILES[displayTile];
                } else {
                    displayTile = 0;
                }
                tiles.push([xt,yt,displayTile]);
            }

        }
        return tiles;
    };

    const finalizeDestructionTiles = destructionTiles => {
        for(let i = 0;i<destructionTiles.length;i++) {
            const [x,y,foregroundTile] = destructionTiles[i];
            world.setForegroundTile(x,y,foregroundTile);
            world.setCollisionTile(x,y,0);
        }
        world.pushCollisionChanges();
    };

    const getDestructionTileFinalizer = destructionTiles =>
    () => finalizeDestructionTiles(destructionTiles);

    const badBomb = () => {
        world.message("This isn't a good place for a bomb!");
    };

    script.placeBomb = () => {
        const result = world.playerImpulse.impulse({tileHandler:data=>{
            const {x,y,value} = data;
            if(value === BOMB_PLACEMENT_ID) {
                const destructionTiles = getDestructionTiles(x,y);
                if(destructionTiles.length) {
                    const inventory = SVCC.Runtime.Inventory;
                    clearInteraction(destructionTiles);

                    inventory.take("bomb",1);
                    if(!inventory.has("bomb")) {
                        world.player.clearWeapon();
                    }

                    const callback = getDestructionTileFinalizer(destructionTiles);
                    addBomb(world,x,y,callback);
                    return true;
                }
            }
            return false;
        }});
        if(!result) badBomb();
    };
}
export default InstallBombAreas;
