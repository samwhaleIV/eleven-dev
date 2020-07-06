async function MapNuke(world,objectiveText,transitionData) {
    if(objectiveText) objectiveText.close();
    world.playSound("TheMapExploded");
    world.dispatchRenderer.addFinalize((context,{width,height})=>{
        context.fillStyle = "black";
        context.fillRect(0,0,width,height);
    });
    await world.fadeToWhite(50);
    world.popFader();
    await world.fadeFromWhite(400);
    await delay(250);
    world.transitionSelf(transitionData,500);
}
export default MapNuke;
