const scale = (player,scale) => {
    if(!player.scale) player.scale = 1;

    const startWidth = player.width;
    const startHeight = player.height;

    const {hitBox} = player;

    if(player.scale * scale === 1) {
        const {baseSize} = player;

        player.width = baseSize.width;
        player.height = baseSize.height;

        hitBox.width = baseSize.hitBoxWidth;
        hitBox.height = baseSize.hitBoxHeight;
    } else {
        player.width = scale; player.height = scale;
        hitBox.width = scale; hitBox.height = scale;
    }

    const widthDifference = startWidth - player.width;
    const heightDifference = startHeight - player.height;

    player.x += widthDifference / 2;
    player.y += heightDifference / 2;
};

const makePlayerSmall = ({player}) => scale(player,0.5);
const makePlayerBig = ({player}) => scale(player,2);

const setBaseSizes = player => {
    if(!player.baseSize) {
        const {hitBox} = player;
        player.baseSize = {
            width: player.width,
            height: player.height,
            hitBoxWidth: hitBox.width,
            hitBoxHeight: hitBox.height
        };
    }
};

function BigPill() {
    this.action = data => {
        const {player} = data;
        setBaseSizes(player);
        switch(player.scale) {
            case 2: return false;
            default:
                makePlayerBig(data);
                player.scale = 2;
                break;
            case 0.5:
                makePlayerBig(data);
                player.scale = 1;
                break;
        }
        return true;
    };
}
function SmallPill() {
    this.action = data => {
        const {player} = data;
        setBaseSizes(player);
        switch(player.scale) {
            case 0.5: return false;
            default:
                makePlayerSmall(data);
                player.scale = 0.5;
                break;
            case 2:
                makePlayerSmall(data);
                player.scale = 1;
                break;
        }
        return true;
    };
}

export default BigPill;
export {BigPill,SmallPill};
