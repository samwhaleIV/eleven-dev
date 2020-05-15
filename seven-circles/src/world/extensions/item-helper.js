import ItemUseTable from "../../items/item-use-table.js";
import ItemNotification from "../item-notification.js";

const DID_NOTHING = "This item won't do anything here.";
const BAD_ITEM_PLACMEMENT = "The item doesn't want to go here!";

function useItem(safeID,take,message) {
    if(take) this.inventory.take(safeID);

    if(message) {
        if(this.playerController && this.playerController.locked) {
            this.playerController.unlock();
        }
        this.message(message);
    }

    return true;
}
function sendPlayerBasedAction(target) {
    return target({script:this.script,world:this,player:this.player});
}
function itemHandler(safeID) {
    if(!(safeID in ItemUseTable)) return false;
    const summonData = ItemUseTable[safeID];
    if(!summonData) return false;

    const {
        tileID, action, spriteData, retain, verifyPlacement
    } = summonData;

    let canPlace = true;
    if(verifyPlacement) canPlace = verifyPlacement(this.script,this);

    if((isNaN(tileID) || !canPlace) && action) {
        if(action) {
            const wasAbleToUse = sendPlayerBasedAction.call(this,action);
            if(wasAbleToUse) {
                return this.useItem(safeID,!Boolean(retain));
            } else {
                return this.useItem(safeID,false,DID_NOTHING);
            }
        } else {
            return false;
        }
    }

    const sprite = this.addTileSprite(0,0,tileID,true);
    const didSummon = this.summonSprite(sprite);

    if(didSummon) {
        if(spriteData) {
            let newData = spriteData;
            if(typeof spriteData === "function") newData = spriteData();
            Object.assign(sprite,newData);
        }
        if(action) sendPlayerBasedAction.call(this,action);
        return this.useItem(safeID,!Boolean(retain));
    } else {
        return this.useItem(safeID,false,BAD_ITEM_PLACMEMENT);
    }
}
function itemNotification(itemName,amount) {
    if(this.script.dontNotifyItems) return;
    ItemNotification(this,itemName,amount);
}
export default {itemNotification, itemHandler, useItem}
