function FaderList(dispatchRenderer) {
    const faders = new Object();
    this.add = fader => {
        const ID = dispatchRenderer.addFinalize(
            fader.render,ZIndexBook.Fader
        );
        fader.ID = ID; faders[ID] = fader;
        return fader;
    };
    this.remove = ID => {
        if(typeof ID === "string") ID = Number(ID);
        dispatchRenderer.removeFinalize(ID);
        delete faders[ID];
    };
    this.clear = () => {
        Object.keys(faders).forEach(this.remove);
    };
    this.list = () => {
        return Object.values(faders);
    };
    this.reload = () => {
        Object.entries(faders).forEach(([oldID,fader])=>{
            delete faders[oldID]; this.add(fader);
        });
    };
    this.pop = () => {
        const faderList = Object.keys(faders);
        if(!faderList.length) return;
        this.remove(faderList[faderList.length-1]);
    };
}
export default FaderList;
