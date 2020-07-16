import {Objects,GetObject} from "../../../src/sequence/objects.js";
import SQContainer from "../../../src/sequence/sq-container.js";

const {ResourceManager,DOMInterface,CanvasManager} = Eleven;
const MISSING_IMAGE = "editor/missing";

const getObjectList = async () => {

    let missingImage = null;

    const buffer = new OffscreenCanvas(16,16);
    const context = buffer.getContext("2d",{alpha:true});

    const getThumbnail = data => {
        let image = null;
        const {thumbnail} = data;
        if(thumbnail) {
            image = ResourceManager.getImage(thumbnail);
        } else {
            image = missingImage;
        }
        if(!image) {
            image = missingImage;
        }
        context.clearRect(0,0,16,16);
        context.drawImage(image,0,0,16,16,0,0,16,16);
        return buffer.transferToImageBitmap();
    };

    const container = new SQContainer({},true);

    for(const type of Object.keys(Objects)) {
        const sqObject = GetObject(container,type);
        sqObject.queueFiles();
    }
    ResourceManager.queueImage(MISSING_IMAGE);

    await ResourceManager.load();
    missingImage = ResourceManager.getImage(MISSING_IMAGE);
    
    const objectList = new Array();

    for(const [type,data] of Object.entries(Objects)) {
        const thumbnail = getThumbnail(data);
        const URI = ResourceManager.bitmapToURI(thumbnail);
        thumbnail.close();
        objectList.push({type,thumbnail:URI});
    }
    
    return objectList;
};

function GenerateObjectElement(
    object,selectionCallback
) {
    const {type,thumbnail} = object;

    const element = document.createElement("div");
    element.className = "object";

    const p = document.createElement("p");
    p.appendChild(document.createTextNode(type));
    const img = new Image();
    img.src = thumbnail;

    element.appendChild(p);
    element.appendChild(img);

    element.onclick = () => {
        selectionCallback(type);
    };

    return element;
}

function DomBrowser(
    {terminate,proxyFrame},objectList,selectionCallback
) {
    const callback = type => {
        if(selectionCallback) {
            selectionCallback(type);
        }
        terminate();
    };

    const browser = document.createElement("div");
    browser.className = "object-browser";

    for(const object of objectList) {
        const objectElement = GenerateObjectElement(
            object,callback
        );
        browser.appendChild(objectElement);
    }

    proxyFrame.keyDown = ({code,repeat}) => {
        if(repeat) return;
        if(code === "KeyO" || code === "Escape") {
            callback(null);
        }
    };

    return browser;
}

async function InstallObjectBrowser(world) {

    const objectList = await getObjectList();

    let browserShown = false;
    const menu = DOMInterface.getMenu(DomBrowser);

    let spawnLocation = null;

    const closeBrowser = () => {
        if(!browserShown) return;
        menu.close();
        browserShown = false;
    };

    const getPasteLocation = objectType => {
        const {width,height} = Objects[objectType];
        const pasteX = spawnLocation.x - width / 2;
        const pasteY = spawnLocation.y - height / 2;
        return {x:pasteX,y:pasteY};
    };

    const onSelection = objectType => {
        browserShown = false;
        if(objectType === null) return;
        const serialData = getPasteLocation(objectType);
        world.addEvents([{
            type: "create",
            serialData,objectType
        }]);
        if(world.browserPastedObject) {
            world.browserPastedObject();
        }
    };

    const openBrowser = () => {
        if(browserShown) return;
        const {x,y} = CanvasManager.pointer;
        spawnLocation = world.grid.getTileLocation(x,y);
        menu.show(objectList,onSelection);
        browserShown = true;
    };

    world.setAction("toggleBrowser",()=>{
        if(browserShown) {
            closeBrowser();
        } else {
            openBrowser();
        }
    });
    world.setAction("exitBrowser",()=>{
        if(browserShown) {
            closeBrowser();
        }
    });

}
export default InstallObjectBrowser;
