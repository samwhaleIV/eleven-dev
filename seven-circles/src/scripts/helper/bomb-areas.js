const BOMB_PLACEMENT_ID = 51;
const BOMB_DESTRUCTION_ID = 50;

const DESTRUCTION_TILES = {
    266: 517,
    267: 518
};

function BombSprite(image,x,y) {
    this.collides = false;
    this.width = 1; this.height = 1;
    this.x = x; this.y = y;
}

const DESTRUCTION_MATRIX = [
    [-1,-1],[0, -1],[1,-1],
    [-1, 0],        [1, 0],
    [-1, 1],[0,  1],[1, 1]
];

function BombAreas(world,script,inventory) {

    const getDestructionTiles = (x,y) => {
        const tiles = [];
        DESTRUCTION_MATRIX.forEach(([xm,ym]) => {
            const xt = xm + x, yt = ym + y;
            const tile = world.getInteractionTile(xt,yt);
            if(tile !== BOMB_DESTRUCTION_ID) {
                let displayTile = world.getForegroundTile(xt,yt);
                if(displayTile in DESTRUCTION_TILES) {
                    displayTile = DESTRUCTION_TILES[displayTile];
                } else {
                    displayTile = 0;
                }
                tiles.push([xt,yt,tile]);
            }
        });
        return tiles;
    };

    const badBomb = () => {
        world.message("This isn't a good place for a bomb!");
    };
    script.placeBomb = () => {
        const result = world.playerImpulse.impulse({tileHandler:data=>{
            const {x,y,value} = data;
            if(value === BOMB_PLACEMENT_ID) {
                const destructionTiles = getDestructionTiles(x,y);
                if(destructionTiles.length) {
                    world.player.clearWeapon();
                    inventory.removeItem("bomb",1);

                    return true;
                }
            }
            badBomb();
            return true;
        }});
        if(!result) badBomb();
    };
}
export default BombAreas;
