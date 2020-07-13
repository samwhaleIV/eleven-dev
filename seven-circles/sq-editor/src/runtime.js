import FileSystem from "./file-system.js";
console.log("Hello, world!");

const {ResourceManager} = Eleven;

(async () => {
    for(const container of FileSystem.getContainers()) {
        ResourceManager.queueJSON(`sq-containers/${container}`);
    }
    await ResourceManager.load();
})();
