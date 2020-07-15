import WindowDialog from "../remote/window-dialog.js";

function AddFileActions(prototype) {
    prototype.save = async function() {
        if(!this.unsaved) {
            if(!this.hasRealPath) {
                return this.saveAs();
            } else {
                return true;
            }
        }
    
        let path;
        if(!this.hasRealPath) {
            const {canceled,filePath} = await WindowDialog.saveAs();
            if(canceled) return false;
            path = filePath;
        } else {
            path = this.filePath;
        }
    
        const exportData = this.container.export();
        await FileSystem.writeFile(path,JSON.stringify(exportData,null,4));
        this.unsaved = false;
    
        return true;
    };
    prototype.saveAs = async function() {
        const {canceled,filePath} = await WindowDialog.saveAs();
        if(canceled) return false;
        this.filePath = filePath;
        this.unsaved = true;
        this.hasRealPath = true;
        return await this.save();
    };
    prototype.openFile = async function() {
        if(!(await this.fileChangeCanContinue())) return;
    
        const {canceled,filePath} = await WindowDialog.selectFile();
        if(canceled) return;
    
        const fileData = await FileSystem.readFile(filePath);
        this.filePath = filePath;
        this.unsaved = false;
        this.hasRealPath = true;
    
        this.resetMap();
        this.container.import(JSON.parse(fileData));
    };
    prototype.fileChangeCanContinue = async function() {
        if(this.unsaved) {
            if(await WindowDialog.prompt("Would you like to save your changes?")) {
                const didSave = await this.save();
                if(!didSave) return false;
            }
        }
        return true;
    };
    prototype.newFile = async function() {
        const setDefault = async () => {
            this.resetMap();
            this.filePath = "Untitled.json";
            this.unsaved = false;
            this.hasRealPath = false;
            if(!this.container.map) {
                await this.selectMapImage();
            }
        };
        if(this.filePath === null || await this.fileChangeCanContinue()) {
            await setDefault();
        }
    };
    prototype.selectMapImage = async function() {
        if(!this.filePath) {
            await this.newFile();
            return;
        }
        const {canceled,filePath} = await WindowDialog.selectMapImage();
        if(canceled) return;
        if(!filePath.startsWith(FileSystem.mapImageFolder)) {
            await WindowDialog.alert("Map image must be located in 'resources/images/maps' folder!");
            return;
        }
        const mapName = FileSystem.baseName(filePath,".png");
        this.container.map = mapName;
    
        this.unsaved = true;
    };
}
export default AddFileActions;
