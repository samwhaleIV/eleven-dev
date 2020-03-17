import Constants from "../constants.js";
import Player from "./player.js";

const PLAYER_SPRITE = Constants.PlayerSprite;

const {AnimatedSprite, ResourceManager, MultiLayer} = Eleven;

function GetPlayerBase(x,y) {
    const sprite = new AnimatedSprite(ResourceManager.getImage(PLAYER_SPRITE),x,y);

    const updateLayer = new MultiLayer();
    const renderLayer = new MultiLayer();
    renderLayer.add(sprite.render);

    const boundAddition = function(multiLayer,layer,priority) {
        return multiLayer.add(layer.bind(this),priority);
    };

    sprite.addRender = boundAddition.bind(sprite,renderLayer);
    sprite.addUpdate = boundAddition.bind(sprite,updateLayer);

    sprite.removeRender = renderLayer.remove;
    sprite.removeUpdate = updateLayer.remove;

    sprite.render = (...data) => renderLayer.forEach(layer => layer(...data));
    sprite.update = (...data) => updateLayer.forEach(layer => layer(...data));

    return sprite;
}

function GetPlayerSprite(x,y,...parameters) {
    const player = GetPlayerBase(x,y);
    Player.apply(player,parameters);
    return player;
}

export default GetPlayerSprite;
