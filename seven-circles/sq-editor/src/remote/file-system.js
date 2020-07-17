const fs = require("fs");
const path = require("path");

const FileSystem = new (function(){
    const resourceRoot = __dirname.split("sq-editor\\")[0] + "resources\\";

    const containerFolder = resourceRoot + "data\\sq-containers\\";
    const mapImageFolder = resourceRoot + "images\\maps\\";

    Object.assign(this,{containerFolder,mapImageFolder});

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

    this.basename = (filePath,extestion) => path.basename(filePath,extestion);
})();
globalThis.FileSystem = FileSystem;

export default FileSystem;
