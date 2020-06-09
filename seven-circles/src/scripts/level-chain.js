const LevelOrder = [
    null,
    "TunnelsOfHell",
    "ChocolateHell",
    "HatHell", //HatStore
    "RiverHell",
    "VoidHell",
    null,
    "GraveHell",
    "DeadHell",
    null,
    "PaintHell",
    "SwitchHell",
    null
];

const LevelChain = new function LevelChain() {
    const lookup = new Object();

    LevelOrder.forEach((levelName,index) => {
        lookup[levelName] = index;
    });

    const getRelative = (delta,name) => {
        if(typeof name !== "string") return null;
        return LevelOrder[lookup[name]+delta] || null;
    };

    const getNext = getRelative.bind(this,+1);
    const getLast = getRelative.bind(this,-1);

    this.getNext = getNext; this.getLast = getLast;
    this.getRange = name => [getLast(name),getNext(name)];

    Object.freeze(this);
}

export default LevelChain;
