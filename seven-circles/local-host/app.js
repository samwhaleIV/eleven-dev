const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const app = express();
const port = 80;

app.use(express.static("../../"));

app.use(fileUpload({
    limits: { 
        fileSize: 1000 * 1024 * 1024 * 1024 //2MB max file(s) size
    },
}));

app.post("/upload-map-data",async req => {

    const mapData = req.files.mapData;

    const file = mapData.data.toString();

    fs.writeFileSync(__dirname + "/../resources/data/maps.json",file);
    return;
});

app.listen(port, function appStarted() {
    console.log(`App listening on port ${port}!`);
});
