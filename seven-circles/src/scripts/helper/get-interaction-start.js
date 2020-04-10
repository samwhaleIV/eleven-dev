const START = 100;
const SPACING = 50;

let value = START;

const GetInteractionStart = () => {
    const yourValue = value;
    value += SPACING;
    return yourValue;
};

export default GetInteractionStart;
