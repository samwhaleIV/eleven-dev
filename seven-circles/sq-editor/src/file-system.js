const fs = require("fs");
const path = require("path");

const FileSystem = new (function(){
    const containerFolder = __dirname.split("sq-editor\\")[0] + "resources/data/sq-containers/";
    this.containerFolder = containerFolder;

    this.readFile = path => {
        return new Promise((resolve,reject) => {
            fs.readFile(path,"utf8",function(err,data) {
                if(err) {
                    console.log(err);
                    reject(err);
                } else {
                    data = data.toString();
                    resolve(data);
                }
            })
        });
    };

    this.writeFile = (path,data) => {
        return new Promise(resolve => {
            data = new Uint8Array(Buffer.from(data));
            fs.writeFile(path,data,resolve);
        });
    };

    this.baseName = filePath => path.basename(filePath);
})();
globalThis.FileSystem = FileSystem;

export default FileSystem;
