import ObjectSelector from "./object-selector.js";

function InstallHandJob(world) {

    const panZoom = world.grid.getPanZoom();
    const objectSelector = new ObjectSelector(world);

    const panTarget = {}, placeTarget = {};

    panZoom.bindToFrame(panTarget);
    objectSelector.bindToFrame(placeTarget);

    let panning = false, placing = false;

    world.clickDown = data => {
        if(panning) return;
        placing = true;
        placeTarget.clickDown(data);
    };
    world.clickUp = data => {
        placing = false;
        placeTarget.clickUp(data);
    };

    world.altClickDown = data => {
        if(placing) return;
        panning = true;
        panTarget.clickDown(data);
    };

    world.altClickUp = data => {
        panning = false
        panTarget.clickUp(data);
    };

    world.pointerMove = data => {
        if(placing) {
            placeTarget.pointerMove(data);
        } else if(panning) {
            panTarget.pointerMove(data);
        }
    };

    world.pointerScroll = data => {
        if(!placing) {
            panTarget.pointerScroll(data);
        }
    };
}

export default InstallHandJob;
