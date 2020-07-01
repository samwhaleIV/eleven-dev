import IAmSpeed from "../../scripts/helper/pills/i-am-speed.js";
import {MakePlayerBig,MakePlayerSmall} from "../../scripts/helper/pills/size-drugs.js";

function SpeedPill() {
    this.action = ({world}) => IAmSpeed(world);
}
function BigPill() {
    this.action = ({world}) => MakePlayerBig(world);
}
function SmallPill() {
    this.action = ({world}) => MakePlayerSmall(world);
}

export {BigPill,SmallPill,SpeedPill};
