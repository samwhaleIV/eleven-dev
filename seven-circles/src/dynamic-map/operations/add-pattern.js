import Pattern from "../pattern.js";

function AddPattern(decoratorBuffer,name,...pattern) {
    const [image,x,y,width,height] = pattern;
    pattern = new Pattern(
        decoratorBuffer,image,x,y,width,height
    );
    decoratorBuffer.patterns[name] = pattern;
}
AddPattern.isLayerless = true;
export default AddPattern;
