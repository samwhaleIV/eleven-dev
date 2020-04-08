import {Items, ItemLookup} from "./items.js";
import SaveState from "../storage/save-state.js";
import InventoryMenu from "../user-interface/inventory-menu.js";

const {DOMInterface,ResourceManager} = Eleven;
const CONTAINER_KEY = "Inventory";
const ITEM_FILE = "items";
const ITEM_TEXTURE_SIZE = 16;

const ITEM_DOES_NOT_EXIST = safeID => {
    throw Error(`Invalid item! Type '${safeID}' does not exist!`);
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
            if(!(safeID in container)) {
                container[safeID] = 0;
            }
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

    this.hasItem = safeID => {
        const itemContainer = getItemContainer();
        const count = itemContainer[safeID];
        return count >= 1;
    };
    this.removeItem = safeID => {
        const itemContainer = getItemContainer();
        const count = itemContainer[safeID];
        if(count >= 1) {
            itemContainer[safeID] = count - 1;
            return true;
        } else {
            return false;
        }
    };
    this.addItem = safeID => {
        const itemContainer = getItemContainer();
        if(!(safeID in itemContainer)) ITEM_DOES_NOT_EXIST(safeID);
        itemContainer[safeID] += 1;
    };
    this.clearItems = () => {
        const container = new Object();
        Items.forEach(item => container[item.safeID] = 0);
        SaveState.set(CONTAINER_KEY,container);
    };

    this.show = menu.show.bind(null,imageList);
    this.close = menu.close;
}
export default Inventory;
