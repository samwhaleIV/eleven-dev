import {AddNamedBackground} from "../helper.js";
import GetDecorator from "../../../dynamic-map/get-decorator.js";

function DynamMap({world}) {

    const C2HellDecorator = GetDecorator(
        ["Color",1,"#980404"],
        ["Outline",1,"#740303"],
        ["Color",2,"#3C0101"],
        ["Color",3,"#F70000"],
        ["Outline",3,"#C60000"],
        ["Shadow",1,3,5,3/4],
        ["Shadow",2,3,5,3/4],
        ["CollisionMap",3]
    );

    const image = world.defaultTileset;

    const ClassicHellDecorator = GetDecorator(
        ["AddPattern","floor",image,112,16,32,32],
        ["AddPattern","wall",image,112,0,32,16],
        ["Pattern",1,"floor"],
        ["Pattern",2,"floor"],
        ["Pattern",3,"wall"],
        ["Outline",3,"#1E120A"],
        ["Shadow",1,3,4,1/2],
        ["Shadow",2,3,4,1/2],
        ["CollisionMap",3]
    );

    world.setMap("test",{
        dynamic: true,
        decorator: C2HellDecorator
    });
    AddNamedBackground(world,"hell");
    world.addPlayer(2.5,3);
}
export default DynamMap;
