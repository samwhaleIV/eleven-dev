import {AddNamedBackground} from "../helper.js";

function DynamMap({world}) {
    world.setDynamicMap("test","c2");
    AddNamedBackground(world,"hell");
    world.addPlayer(2.5,3);
}
export default DynamMap;
