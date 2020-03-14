const fs = require("fs");
const path = require("path");
const xmlParser = require("fast-xml-parser");
const he = require("he");

const INPUT_FOLDER = "./input/";
const OUTPUT_PATH = "../resources/data/maps.json";
const OUTPUT_VARIABLE_PREFIX = "";
const MAP_DEV_FOLDER = "../map-dev/maps/";
const MAP_DEV_INPUT_FORMAT = ".tmx";
const JSON_FILE_EXTENSION = ".json";
const INVERSE_CIPHER_LOOKUP = (function(inverse=true){
    const o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    n=o.length,c=Math.pow(n,2),r={};for(let e=0;e<c;e++)
    {const c=o[Math.floor(e/n)],f=o[e%n];inverse?r[e]=c+f:r[c+f]=e}return r;
})();

const XML_PARSE_OPTIONS = {
    attributeNamePrefix : "",
    attrNodeName: "attr",
    textNodeName: "value",
    ignoreAttributes: false,
    ignoreNameSpace: true,
    allowBooleanAttributes: false,
    parseNodeValue: false,
    parseAttributeValue: true,
    trimValues: true,
    parseTrueNumberOnly: false,
    attrValueProcessor: val => he.decode(val,{isAttributeValue: true}),
    tagValueProcessor : val => he.decode(val),
    stopNodes: []
}

const devMapFiles = [];
const shortDevMapFileList = [];
fs.readdirSync(MAP_DEV_FOLDER).forEach(fileName => {
    if(fileName.endsWith(MAP_DEV_INPUT_FORMAT)) {
        shortDevMapFileList.push(fileName);
        const targetName = fileName.split(MAP_DEV_INPUT_FORMAT)[0]
        devMapFiles.push({
            source: path.resolve(MAP_DEV_FOLDER + fileName),
            target: path.resolve(INPUT_FOLDER + targetName + JSON_FILE_EXTENSION),
            targetName: targetName
        });
    }
});
function process_csv_xml_data(layer) {
    return {
        data: layer.data.value.split(",").map(Number)
    };
}
const allMapData = [];
function self_compile_map_file(mapFile) {

    const xmlData = fs.readFileSync(mapFile.source).toString();
    const jsonData = xmlParser.parse(xmlData,XML_PARSE_OPTIONS);

    const rawMap = {};

    const tileSets = jsonData.map.tileset;
    if(!Array.isArray(tileSets)) {
        return;
    }
    let lightingTileset = null, collisionTileset = null, baseTileset = null;
    tileSets.forEach(tileset => {
        const offset = tileset.attr.firstgid;
        const tilesetName = tileset.attr.source;
        if(tilesetName.endsWith("world-tileset.tsx")) {
            baseTileset = offset;
        } else if(tilesetName.endsWith("collision-tileset.tsx")) {
            collisionTileset = offset;
        } else if(tilesetName.endsWith("light-tileset.tsx")) {
            lightingTileset = offset;
        }
    });
    if(baseTileset !== null) {
        rawMap.normalOffset = baseTileset;
    }
    if(collisionTileset !== null) {
        rawMap.collisionOffset = collisionTileset;
    }
    if(lightingTileset !== null) {
        rawMap.lightingOffset = lightingTileset;
    }

    const map = jsonData.map;
    const backgroundLayer = map.layer[0];
    const foregroundLayer = map.layer[1];
    const collisionLayer = map.layer[2];
    let lightingLayer = null;
    if(map.layer[3]) {
        lightingLayer = map.layer[3]
    }

    rawMap.width = backgroundLayer.attr.width;
    rawMap.height = backgroundLayer.attr.height;

    rawMap.layers = [
        process_csv_xml_data(backgroundLayer),
        process_csv_xml_data(foregroundLayer),
        process_csv_xml_data(collisionLayer)
    ];
    if(lightingLayer !== null) {
        rawMap.layers.push(
            process_csv_xml_data(lightingLayer)
        );
    }
    allMapData.push({
        name: mapFile.targetName,
        data: rawMap
    });
    console.log("Fast compiled: " + mapFile.source);
    
}
devMapFiles.forEach(self_compile_map_file);
const encodeLayer = layer => {
    layer.forEach((value,index)=>{
        layer[index] = INVERSE_CIPHER_LOOKUP[value];
    });
    return layer.join("");
}
const encodeMapLayers = map => {
    map.background = encodeLayer(map.background);
    map.foreground = encodeLayer(map.foreground);
    map.collision =  encodeLayer(map.collision);
    if(map.lighting) {
        map.lighting = encodeLayer(map.lighting);
    }
}

const compiledMapData = {};
function processMapData(rawMap,name) {
    console.log("Compiling second pass: " + name)
    const map = {};

    map.background = rawMap.layers[0].data;
    map.foreground = rawMap.layers[1].data;
    map.collision = rawMap.layers[2].data;
    if(rawMap.layers[3]) {
        map.lighting = rawMap.layers[3].data;
    }

    map.columns = rawMap.width;
    map.rows = rawMap.height;

    for(let i = 0;i<map.background.length;i++) {
        map.background[i] = (map.background[i] || 1) - rawMap.normalOffset;
        map.foreground[i] = (map.foreground[i] || 1) - rawMap.normalOffset;
        if(map.collision[i] !== 0) {
            map.collision[i] = map.collision[i] - rawMap.collisionOffset;
        }
        if(map.lighting) {
            if(map.lighting[i] !== 0) {
                map.lighting[i] = map.lighting[i] - rawMap.lightingOffset;
            }
        }
    }

    encodeMapLayers(map);
    compiledMapData[name] = map;
}
allMapData.forEach(rawMap => processMapData(rawMap.data,rawMap.name));
console.log("Exporting compiled map data...")
fs.writeFileSync(OUTPUT_PATH,`${OUTPUT_VARIABLE_PREFIX}${JSON.stringify(compiledMapData)}`);
console.log("Done.");
