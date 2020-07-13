const TheOG = ({image}) => [
    ["AddPattern","floor",image,112,16,32,32],
    ["AddPattern","wall",image,112,0,32,16],
    ["Pattern",1,"floor"],
    ["Pattern",2,"floor"],
    ["Pattern",3,"wall"],
    ["Outline",3,"#1E120A"],
    ["Shadow",1,3,3,3/5],
    ["Shadow",2,3,3,3/5],
    ["CollisionMap",3]
];

const Decorators = {
    none: () => [
        ["Color",1,"#ff0000"],
        ["Color",2,"#00ff00"],
        ["Color",3,"#0000ff"],
        ["CollisionMap",3]
    ],
    c1: TheOG,
    og: TheOG,
    classic: TheOG,
    c2: () => [
        ["Color",1,"#980404"],
        ["Outline",1,"#740303"],
        ["Color",2,"#3C0101"],
        ["Color",3,"#F70000"],
        ["Outline",3,"#C60000"],
        ["Shadow",1,3,4,3/5],
        ["Shadow",2,3,4,3/5],
        ["CollisionMap",3]
    ]
};
export default Decorators;
