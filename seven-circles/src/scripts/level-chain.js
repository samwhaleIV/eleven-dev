const LevelBlocks = [
    /* The last instance of a level name is put into the lookup table */
    [
        //Intro sequence
        "HelloWorld",
        "TheBeginning",
        "HelloHell",

        "TunnelsOfHell",
        "ChocolateHell",
        "HatHell",

        "PaintHell",
        "SaveHell",
        "RiverHell",

        "VoidHell",
        "BombHell",
        "MineHell",

        null,
        "MazeHell",
        "SwitchHell",

        null,
        "GraveHell",
        null,
        "DeadHell",
        null,
        "PondHell",
    ]
];

const LevelChain = new function LevelChain() {
    const lookup = new Object();

    LevelBlocks.forEach((block,blockIndex) => block.forEach((levelName,index) => {
        if(levelName === null) return;
        lookup[levelName] = [blockIndex,index];
    }));

    const getRelative = (delta,name) => {
        if(typeof name !== "string") return null;

        const result = lookup[name]; if(!result) return null;

        const [blockIndex,index] = result;
        return LevelBlocks[blockIndex][index+delta] || null;
    };

    const getNext = getRelative.bind(this,+1);
    const getLast = getRelative.bind(this,-1);

    this.getNext = getNext; this.getLast = getLast;
    this.getRange = name => [getLast(name),getNext(name)];

    Object.freeze(this);
}

export default LevelChain;
