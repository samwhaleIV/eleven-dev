
const FRIENDLY_COLOR = "#0000FF";
const HOSTILE_COLOR = "#FF0000";
const NEUTRAL_COLOR = "#ffffff";

const FRIENDLY_ID = 1;
const NEUTRAL_ID = 2;
const HOSTILE_ID = 3;

const Alignments = Object.freeze({
    Friendly: Object.freeze({
        ID: FRIENDLY_ID,
        name: "Friendly",
        color: FRIENDLY_COLOR,
        canAttack: Object.seal({
            [FRIENDLY_ID]: false,
            [NEUTRAL_ID]: true,
            [HOSTILE_ID]: true
        })
    }),
    Neutral: Object.freeze({
        ID: NEUTRAL_ID,
        name: "Neutral",
        color: NEUTRAL_COLOR,
        canAttack: Object.seal({
            [FRIENDLY_ID]: true,
            [NEUTRAL_ID]: true,
            [HOSTILE_ID]: true
        })
    }),
    Hostile: Object.freeze({
        ID: HOSTILE_ID,
        name: "Hostile",
        color: HOSTILE_COLOR,
        canAttack: Object.seal({
            [FRIENDLY_ID]: true,
            [NEUTRAL_ID]: true,
            [HOSTILE_ID]: false
        })
    })
});

export default Alignments;
