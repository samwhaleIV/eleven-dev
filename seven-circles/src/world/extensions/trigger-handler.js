const REPEAT_CODE = "repeat";

function setTriggers(triggerSet) {
    this.validateParseOnlyMethod();

    const worldTriggerSet = new Object();

    triggerSet.forEach(trigger=>{
        if(!trigger) return;
        const [ID,handler,fireOnce=false] = trigger;
        worldTriggerSet[ID] = {fireOnce,handler,fired:false};
    });

    let activeTrigger = null;

    const sendTrigger = ID => {
        const triggerData = worldTriggerSet[ID];
        if(!triggerData || (triggerData.fireOnce && triggerData.fired)) return;
        const result = triggerData.handler(!triggerData.fired);
        triggerData.fired = true;
        return result !== REPEAT_CODE;
    };

    const trigger = ID => {
        if(activeTrigger === null || activeTrigger !== ID) {
            if(sendTrigger(ID)) activeTrigger = ID;
        }
    };
    const noTrigger = () => {
        activeTrigger = null;
    };

    Object.assign(this.pendingScriptData,{trigger,noTrigger});
}
export default {setTriggers};
