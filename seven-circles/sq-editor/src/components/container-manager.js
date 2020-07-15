import SQContainer from "../../../src/sequence/sq-container.js";
import Decorators from "../../../src/dynamic-map/decorators.js";
import GetDecorator from "../../../src/dynamic-map/get-decorator.js";

const {ResourceManager} = Eleven;

function InstallContainer(target) {
    const container = new SQContainer(target,true);
    target.container = container;
    const {dispatchRenderer,grid} = target;

    let decorator = null, map = null, backgroundID = null;

    const setBackground = image => {
        if(backgroundID !== null) {
            dispatchRenderer.removeBackground(backgroundID);
        }
        const cacheRenderer = grid.drawCache.bind(
            null,{data:{buffer:image}}
        );
        backgroundID = dispatchRenderer.addBackground(cacheRenderer,1);
    };

    const paintMap = () => {
        if(!map) return;
        const {image} = decorator(map);
        setBackground(image);
    };
    const setMap = newMap => {
        map = newMap;
        paintMap();
    };
    const clearMap = () => {
        map = null;
        if(backgroundID) {
            dispatchRenderer.removeBackground(backgroundID);
            backgroundID = null;
        }
    };
    const setDecorator = decoratorName => {
        if(!decoratorName) decoratorName = "none";
        let operations = Decorators[decoratorName];
        if(!operations) {
            console.warn(`Decorator '${decoratorName}' not found!`);
            operations = Decorators.none;
        }
        operations = operations({
            world: target,
            image: target.tileset
        });
        decorator = GetDecorator(operations);
        paintMap();
    };

    setDecorator("none");

    container.on("map-changed",async map => {
        if(!map) {
            clearMap();
            return;
        }
        const name = `maps/${map}`;
        ResourceManager.queueImage(name);
        await ResourceManager.load();
        const mapImage = ResourceManager.getImage(name);
        setMap(mapImage);
    });
    container.on("decorator-changed",setDecorator);
}
export default InstallContainer;
