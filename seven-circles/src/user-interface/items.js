const useInWorld = (useItem,ID) => {
    if(useItem) return useItem(ID);
    return false;
};

const ITEM_DATA = [
    ["Elf Rock",useInWorld],
    ["Rock",useInWorld],
    ["Sink",useInWorld],
    ["Present",useInWorld]
];

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

const makeItem = ([name,action],ID) => {
    return {name,action:actionFilter(action,ID),ID};
};
const Items = Object.freeze(
    ITEM_DATA.map((value,index)=>makeItem(value,index))
);

export default Items;