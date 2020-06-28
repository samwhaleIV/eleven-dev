const getOuterWallPattern = wall => {
    return {
        /* Simple walls */
        "*** fw* ***": wall.full[1][0], //left
        "*** *wf ***": wall.full[1][2], //Right
        "*** *w* *f*": wall.full[2][1], //Top
        "*f* *w* ***": wall.full[0][1], //Bottom

        /* Corner pieces */
        "*w* wwf ***": wall.full[2][2], //Top left
        "*w* fww ***": wall.full[2][0], //Top right
        "*** wwf *w*": wall.full[0][2], //Bottom left
        "*** fww *w*": wall.full[0][0], //Bottom right

        /* Inverse corners */
        "*** *ww *w*": wall.inverse[0][0], //Top left
        "*w* *ww ***": wall.inverse[1][0], //Top right
        "*** ww* *w*": wall.inverse[0][1], //Bottom left
        "*w* ww* ***": wall.inverse[1][1] //Bottom right
    };
};

const getInnerWallPattern = wall => {
    return {
        /* Simple walls */
        "*** wf* ***": wall.full[1][0], //Left
        "*** *fw ***": wall.full[1][2], //Right
        "*** *f* *w*": wall.full[2][1], //Top
        "*w* *f* ***": wall.full[0][1], //Bottom

        /* Corner pieces */
        "ww* wf* ***": wall.full[0][0], //Top left
        "*ww *fw ***": wall.full[0][2], //Top right
        "*** wf* ww*": wall.full[2][0], //Bottom left
        "*** *fw *ww": wall.full[2][2], //Bottom right

        /* Inverse corners */
        "wf* ff* ***": wall.inverse[1][1], //Top left
        "*fw *ff ***": wall.inverse[1][0], //Top right
        "*** ff* wf*": wall.inverse[0][1], //Bottom left
        "*** *ff *fw": wall.inverse[0][0]  //Bottom right
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
