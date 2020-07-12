function ColorFill({buffer,layer},color) {
    color = buffer.addColor(color);
    for(const [x,y] of layer) buffer.set(x,y,color);
}
export default ColorFill;
