const fs = require("fs");
const path = require("path");

const FileSystem = new (function(){
    const containerFolder = __dirname.split("sq-editor\\")[0] + "resources/data/sq-containers/";

    this.saveContainer = (name,data) => {
        return new Promise(resolve => {
            data = new Uint8Array(Buffer.from(data));
            fs.writeFile(`${containerFolder}${name}.json`,data,resolve);
        });
    };

    this.getContainers = () => {
        const containers = [];
        fs.readdirSync(containerFolder).forEach(file => {
            const containerName = path.basename(file,".json");
            containers.push(containerName);
        });
        return containers
    };
})();

export default FileSystem;
