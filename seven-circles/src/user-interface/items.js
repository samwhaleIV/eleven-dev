const useInWorld = (useItem,ID) => {
    if(useItem) return useItem(ID);
    return false;
};
const noAction = () => {};

const ITEM_DATA = [
    ["Elf Rock","elf-rock",useInWorld],
    ["Rock","rock",useInWorld],
    ["Sink","sink",useInWorld],
    ["Present","present",useInWorld]
];

const ItemLookup = new Object();

const actionFilter = (action,itemID) => {
    return () => {
        let useItem = null;
    
        const {frame} = Eleven.CanvasManager;
        if(frame) {
            const {script} = frame;
            if(script) useItem = script.useItem || null;
        }
    
        return action(useItem,itemID);
    };
};

const makeItem = ([name,safeID,action],ID) => {
    action = action ? actionFilter(action,safeID) : noAction;

    const item = {name,action,ID,safeID};
    ItemLookup[safeID] = item; return item;
};
const Items = Object.freeze(
    ITEM_DATA.map((value,index)=>makeItem(value,index))
);

Object.freeze(ItemLookup);

export default Items;
export {Items, ItemLookup};
