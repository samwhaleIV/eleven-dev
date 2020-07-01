import {Items,ItemLookup} from "./items.js";
import SaveState from "../storage/save-state.js";
import InventoryMenu from "../user-interface/inventory-menu.js";

const {DOMInterface,ResourceManager,CanvasManager} = Eleven;
const CONTAINER_KEY = "Inventory";
const ITEM_FILE = "items";
const ITEM_TEXTURE_SIZE = 16;

const ITEM_DOES_NOT_EXIST = safeID => {
    throw Error(`Invalid item! Type '${safeID}' does not exist!`);
};

const validateSafeID = safeID => {
    if(!(safeID in ItemLookup)) ITEM_DOES_NOT_EXIST(safeID);
};

function getImageList() {
    const imageList = new Array();
    const itemImage = ResourceManager.getImage(ITEM_FILE);
    if(!itemImage) return imageList;

    const size = ITEM_TEXTURE_SIZE;
    const itemCount = itemImage.width / size;

    const buffer = document.createElement("canvas");
    buffer.width = size; buffer.height = size;

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
    const menu = DOMInterface.getMenu(InventoryMenu.bind(this));

    const getItemContainer = () => {
        let container = SaveState.get(CONTAINER_KEY);
        if(!container) {
            container = new Object();
            SaveState.set(CONTAINER_KEY,container);
        }
        Items.forEach(({safeID}) => {
            if(!(safeID in container)) container[safeID] = 0;
        });
        return container;
    };

    const getItems = () => {
        const itemContainer = getItemContainer();
        const items = new Array();
        Object.entries(itemContainer).forEach(([itemType,count])=>{
            if(!count) return;
            const item = ItemLookup[itemType];
            const cloneItem = Object.assign(new Object(),item);
            if(count >= 2) cloneItem.name += ` - ${count}`;
            items.push(cloneItem);
        });
        return items;
    };

    const displayItemMapper = ({name,ID,action}) => [name,imageList[ID],action];
    this.getDisplayItems = () => getItems().map(displayItemMapper);

    this.getItems = getItems;

    const countItem = safeID => {
        validateSafeID(safeID);

        const itemContainer = getItemContainer();
        return itemContainer[safeID];
    };

    this.has = safeID => countItem(safeID) >= 1;

    this.countItem = countItem;

    this.take = (safeID,amount) => {
        validateSafeID(safeID);

        if(isNaN(amount)) amount = 1;

        if(amount < 1) return;

        const itemContainer = getItemContainer();

        let newCount = itemContainer[safeID] - amount;
        if(newCount < 0) newCount = 0;
        itemContainer[safeID] = newCount;
    };
    this.give = (safeID,amount) => {
        validateSafeID(safeID);

        if(isNaN(amount)) amount = 1;

        if(amount < 1) return;

        if(CanvasManager.frame && CanvasManager.frame.itemNotification) {
            CanvasManager.frame.itemNotification(ItemLookup[safeID].name,amount);
        }

        const itemContainer = getItemContainer();
        itemContainer[safeID] += amount;
    };
    this.clearAll = () => {
        const container = new Object();
        Items.forEach(item => container[item.safeID] = 0);
        SaveState.set(CONTAINER_KEY,container);
    };

    this.clear = safeID => {
        validateSafeID(safeID);

        const itemContainer = getItemContainer();
        itemContainer[safeID] = 0;
    };

    this.show = menu.show;
    this.close = menu.close;
}
export default Inventory;
