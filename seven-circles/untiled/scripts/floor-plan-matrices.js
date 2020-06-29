const getOuterWallPattern = wall => {
    const {full,inverse} = wall;
    return {
        /* Simple walls */
        "*** fw* ***": full[1][0], //left
        "*** *wf ***": full[1][2], //Right
        "*** *w* *f*": full[2][1], //Top
        "*f* *w* ***": full[0][1], //Bottom

        /* Corner pieces */
        "*w* wwf ***": full[2][2], //Top left
        "*w* fww ***": full[2][0], //Top right
        "*** wwf *w*": full[0][2], //Bottom left
        "*** fww *w*": full[0][0], //Bottom right

        /* Inverse corners */
        "*** *ww *w*": inverse[0][0], //Top left
        "*w* *ww ***": inverse[1][0], //Top right
        "*** ww* *w*": inverse[0][1], //Bottom left
        "*w* ww* ***": inverse[1][1] //Bottom right
    };
};

const getInnerWallPattern = wall => {
    const {full,inverse} = wall;
    return {
        /* Simple walls */
        "*** wf* ***": full[1][0], //Left
        "*** *fw ***": full[1][2], //Right
        "*** *f* *w*": full[2][1], //Top
        "*w* *f* ***": full[0][1], //Bottom

        /* Corner pieces */
        "ww* wf* ***": full[0][0], //Top left
        "*ww *fw ***": full[0][2], //Top right
        "*** wf* ww*": full[2][0], //Bottom left
        "*** *fw *ww": full[2][2], //Bottom right

        /* Inverse corners */
        "wf* ff* ***": inverse[1][1], //Top left
        "*fw *ff ***": inverse[1][0], //Top right
        "*** ff* wf*": inverse[0][1], //Bottom left
        "*** *ff *fw": inverse[0][0]  //Bottom right
    };
};

const getFloorShadowPattern = shadow => {
    return {
        /* Shadows */
        "*** wf* ***": shadow[1][0], //Left wall
        "ww* wf* ***": shadow[0][0], //L corner
        "*w* *f* ***": shadow[0][1], //Top wall
        "wf* ff* ***": shadow[1][1]  //Inverse corner
    };
};

export {
    getOuterWallPattern,
    getInnerWallPattern,
    getFloorShadowPattern
};
