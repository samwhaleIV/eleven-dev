import Items from "./items.js";
import InputCodes from "./input-codes.js";

const {DOMInterface,ResourceManager} = Eleven;

const ITEM_FILE = "items";
const ITEM_TEXTURE_SIZE = 16;
const DOM_MAX_COLUMNS = 5;

function getItems(imageList) {
    const items = Items.map(({name,ID,action})=>{
        return [name,imageList[ID],action];
    });

    items.forEach(item=>items.push(item));
    return items;
}

function getNamedDiv(name) {
    const div = document.createElement("div");
    div.className = name;
    return div;
}

function InstallInventoryItems(uiExit,managedGamepad,imageList,proxyFrame,menu) {
    const itemsList = getItems(imageList);
    const hasItems = itemsList.length >= 1;

    let selected, selectedID, itemAction;
    let itemCount = 0;

    const clearHover = () => {
        if(selected) selected.classList.remove("selected");
        selected = null, selectedID = null, itemAction = null;
    };
    clearHover();

    const uiItems = new Array();

    const setHover = ([uiItem,ID,action]) => {
        clearHover();
        selected = uiItem, selectedID = ID;
        itemAction = action;
        selected.classList.add("selected");
    };

    const trySetSelection = difference => {
        if(selectedID === null) {
            setHover(uiItems[0]);
            return false;
        }
        if(difference) {
            const index = selectedID + difference;
            if(index >= 0 && index < itemCount) {
                setHover(uiItems[index]);
            }
        }
        return true;
    };

    const maxColumns = DOM_MAX_COLUMNS;

    const horizontalMove = positive => {
        if(!trySetSelection()) return;

        const rowCount = Math.ceil(itemCount / maxColumns);
        const lastRowLength = maxColumns - (rowCount * maxColumns - itemCount);
        const lastRowStart = itemCount - lastRowLength;

        let length, column;
        if(selectedID >= lastRowStart) {
            length = lastRowLength;
            column = selectedID - lastRowStart;
        } else {
            length = maxColumns;
            column = selectedID % maxColumns;
        }
        if(positive) {
            if(column + 1 < length) {
                trySetSelection(1);
            }
        } else {
            if(column - 1 >= 0) {
                trySetSelection(-1);
            }
        }
    };

    const uiLeft = () => horizontalMove(false);
    const uiRight = () => horizontalMove(true);

    const uiUp = () => {
        if(!trySetSelection()) return;

        const rowCount = Math.ceil(itemCount / maxColumns);
        if(rowCount === 1) return;

        const lastRowLength = maxColumns - (rowCount * maxColumns - itemCount);
        const lastRowStart = itemCount - lastRowLength;

        if(selectedID >= lastRowStart) {
            const halfDifference = (maxColumns - lastRowLength) / 2;
            trySetSelection(-maxColumns + Math.floor(halfDifference));
        } else {
            trySetSelection(-maxColumns);
        }
    };
    const uiDown = () => {
        if(!trySetSelection()) return;

        const rowCount = Math.ceil(itemCount / maxColumns);
        if(rowCount === 1) return;

        const lastRowLength = maxColumns - (rowCount * maxColumns - itemCount);
        const lastRowStart = itemCount - lastRowLength;


        if(selectedID >= lastRowStart) {
            return;
        } else if(selectedID >= lastRowStart - maxColumns) {
            const halfDifference = (maxColumns - lastRowLength) / 2;
            const column = selectedID % 5;
            if(halfDifference === 0.5 && column === 0) {
                trySetSelection(maxColumns);
                return;
            }
            if(column < halfDifference || column >= maxColumns - halfDifference) return;

            const index = selectedID + maxColumns - halfDifference;
            trySetSelection(Math.floor(index-selectedID));
        } else {
            trySetSelection(maxColumns);
        }
    };
    const uiAccept = () => {
        if(!itemAction) return;
        if(itemAction()) uiExit();
    };
    const keyDown = key => {
        if(key.repeat) return;
        switch(key.impulse) {
            case InputCodes.Inventory:
            case InputCodes.Exit: uiExit(); return;
        }
        if(!hasItems) return;
        switch(key.impulse) {
            case InputCodes.Up: uiUp(); return;
            case InputCodes.Down: uiDown(); return;
            case InputCodes.Left: uiLeft(); return;
            case InputCodes.Right: uiRight(); return;
            case InputCodes.Click: uiAccept(); return;
        }
    };

    proxyFrame.keyDown = SVCC.Runtime.InputServer.keyBind.impulse(keyDown);
    proxyFrame.inputGamepad = managedGamepad.poll;
    managedGamepad.keyDown = keyDown;

    itemsList.forEach((item,index) => {
        const [name,imageData,action] = item;

        itemCount++;
        const uiItem = getNamedDiv("item");

        const image = new Image();
        image.src = imageData;
        uiItem.appendChild(image);

        const label = document.createElement("p");
        label.appendChild(document.createTextNode(name));
        uiItem.appendChild(label);

        const hoverData = [uiItem,index,action];
        uiItems.push(hoverData);

        uiItem.onpointerover = () => setHover(hoverData);
        uiItem.onpointerout = clearHover;
        uiItem.onpointerdown = uiAccept;

        menu.appendChild(uiItem);
    });

    if(hasItems) trySetSelection();
}

function InventoryMenu({terminate,proxyFrame},imageList) {

    let itemTerminator = null;

    const {InputServer} = SVCC.Runtime;
    const managedGamepad = InputServer.managedGamepad;
    managedGamepad.save();

    const uiExit = () => {
        managedGamepad.restore(); terminate();
    };
    
    const menu = getNamedDiv("inventory center");

    itemTerminator = InstallInventoryItems(uiExit,managedGamepad,imageList,proxyFrame,menu);

    const closeButton = getNamedDiv("close-button");
    menu.appendChild(closeButton);

    closeButton.onclick = uiExit;

    return menu;
}

function getImageList() {
    const imageList = new Array();
    const itemImage = ResourceManager.getImage(ITEM_FILE);
    if(!itemImage) return imageList;

    const size = ITEM_TEXTURE_SIZE;

    const itemCount = itemImage.width / size;

    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;

    const context = buffer.getContext("2d",{alpha:true});

    for(let i = 0;i<itemCount;i++) {
        context.clearRect(0,0,size,size);
        context.drawImage(itemImage,i*size,0,size,size,0,0,size,size);
        imageList[i] = buffer.toDataURL("image/png",1);
    }

    return imageList;
}

function Inventory() {
    const imageList = getImageList();
    const menu = DOMInterface.getMenu(InventoryMenu);
    this.show = callback => {
        menu.show(imageList,callback);
    };
    this.close = menu.close;
}
export default Inventory;
