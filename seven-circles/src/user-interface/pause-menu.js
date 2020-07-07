import ManagedBase from "./managed-base.js";

function PauseMenu({terminate,proxyFrame},callback) {
    const {CanvasManager,ResourceManager} = Eleven;
    const {size,canvas} = CanvasManager;

    const buffer = new OffscreenCanvas(size.width,size.height);
    const bufferContext = buffer.getContext("2d",{alpha:false});
    bufferContext.drawImage(
        canvas,0,0,buffer.width,buffer.height,0,0,buffer.width,buffer.height
    );
    bufferContext.fillStyle = "#F8F8F8F8";
    bufferContext.fillRect(0,0,buffer.width,buffer.height);

    proxyFrame.opaque = true;
    proxyFrame.render = (context,size) => {
        context.drawImage(
            buffer,0,0,buffer.width,buffer.height,0,0,size.width,size.height
        );
    };

    const menu = document.createElement("div");
    menu.className = "pause-menu center";

    const overlay = new Image();
    overlay.src = ResourceManager.bitmapToURI(
        ResourceManager.getImage("pause-overlay")
    );

    const panel = new Image();

    menu.appendChild(overlay);
    menu.appendChild(panel);

    const panelImageMaster = ResourceManager.getImage("pause-panel");
    const panelCount = 4;

    const panelWidth = panelImageMaster.width;
    const panelHeight = panelImageMaster.height / panelCount;

    const panelImages = new Array(panelCount);
    for(let i = 0;i<panelImages.length;i++) {
        panelImages[i] = ResourceManager.bitmapToURI(
            panelImageMaster,0,i*panelHeight,panelWidth,panelHeight
        );
    }

    panel.src = panelImages[0];
    const panelZoom = 2;
    panel.style.zoom = panelZoom;

    let selection = 0;
    const setPanelSelection = ID => {
        selection = ID;
        panel.src = panelImages[ID];
    };

    const buttonRanges = [
        [1,1,46,13],
        [48,1,36,13],
        [85,1,27,13]
    ].map(hitBox=>{
        hitBox[0] /= panelWidth; hitBox[1] /= panelHeight;

        hitBox[2] /= panelWidth; hitBox[3] /= panelHeight;

        hitBox[2] += hitBox[0]; hitBox[3] += hitBox[1];
        return hitBox;
    });

    panel.onpointerleave = () => setPanelSelection(0);
    panel.draggable = false;

    const hits = (x,y) => {
        for(let i = 0;i<buttonRanges.length;i++) {
            const [left,top,right,bottom] = buttonRanges[i];
            if(x >= left && x <= right && y >= top && y <= bottom) {
                setPanelSelection(i+1);
                return;
            }
        }
        setPanelSelection(0);
    };

    const updateMousePosition = event => {
        const relationalX = event.offsetX / panel.clientWidth / panelZoom;
        const relationalY = event.offsetY / panel.clientHeight / panelZoom;
        hits(relationalX,relationalY);  
    };

    panel.onpointermove = updateMousePosition;

    const cycleSelection = delta => {
        if(!selection) {
            setPanelSelection(3);
            return;
        }
        let currentSelection = selection;
        currentSelection += delta;
        if(currentSelection < 1) {
            currentSelection = panelCount - 1;
        } else if(currentSelection > panelCount - 1) {
            currentSelection = 1;
        }
        setPanelSelection(currentSelection);
    };

    const accept = (fromKey=false) => {
        if(selection >= 1) {
            const currentSelection = selection;
            if(!fromKey) setPanelSelection(0);
            switch(currentSelection) {
                case 1:
                    SVCC.Runtime.ConfigKeyBinds(proxyFrame.render);
                    return;
                case 2:
                    SVCC.Runtime.ConfigAudio(proxyFrame.render);
                    return;
                case 3:
                    exit();
                    return;
            }
        }
    };

    const exit = ManagedBase(proxyFrame,()=>{
        terminate(); if(callback) callback();
    },({impulse})=>{
        switch(impulse) {
            case "MoveLeft":
            case "MoveUp":
                cycleSelection(-1);
                return;
            case "MoveRight":
            case "MoveDown":
                cycleSelection(1);
                return;
            case "Enter": accept(true); return;
            case "Escape": return "exit";
        }
    });

    panel.onpointerdown = event => {
        updateMousePosition(event);
    };
    panel.onpointerup = event => {
        updateMousePosition(event);
        accept();
    };

    return menu;
}
export default PauseMenu;

