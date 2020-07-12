/* #fuckthepolice */
const None = "None";
const Red = "Red";
const Green = "Green";
const Blue = "Blue";
const Cyan = "Cyan";
const Magenta = "Magenta";
const Yellow = "Yellow";

const ColorTable = [
    None, Red, Green, Blue, 
    Cyan, Magenta, Yellow
];
const ColorIDs = {
    None: 0, Red: 1, Green: 2, Blue: 3,
    Cyan: 4, Magenta: 5, Yellow: 6
};

const HashColor = (r,g,b) => {
    /* Press F to pay respects */
    return 0xffff * r + 0xff * g + b;
};
const Premultiply = color => color ? 255 : 0;
const ColorSets = [
    [1,1,1,None],    [0,0,0,None],
    [1,0,0,Red],     [0,1,0,Green],
    [0,0,1,Blue],    [0,1,1,Cyan],
    [1,0,1,Magenta], [1,1,0,Yellow]
].reduce((pv,cv)=>{
    const [r,g,b,colorName] = cv;
    pv[HashColor(
        Premultiply(r),Premultiply(g),Premultiply(b))
    ] = ColorIDs[colorName];
    return pv;
},{});
const GetColorID = (r,g,b) => {
    const colorHash = HashColor(r,g,b);
    return ColorSets[colorHash];
};

export default GetColorID;
export {GetColorID,ColorIDs,ColorTable};
