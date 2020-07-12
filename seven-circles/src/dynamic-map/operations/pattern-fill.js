const BAD_PATTERN = name => {
    throw Error(`Pattern '${name}' was not installed during prior decoration operations!`);
};

function PatternFill({buffer,layer},patternName) {
    const pattern = buffer.patterns[patternName];
    if(!pattern) BAD_PATTERN(patternName);

    for(const [x,y] of layer) {
        buffer.set(x,y,pattern.getColor(x,y));
    }
}
export default PatternFill;
