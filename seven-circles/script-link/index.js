const fs = require("fs");
const path = require("path");

const NEW_LINE = "\n";
const TAB = `    `;

const MANIFEST_FILE = "manifest.js";

const SCRIPT_ROOT = "../src/scripts/";
const SCRIPT_FOLDER = "main/";

const INPUT_FOLDER = SCRIPT_ROOT + SCRIPT_FOLDER;
const OUTPUT_PATH = SCRIPT_ROOT + MANIFEST_FILE;

let output = "";
const writeLine = line => {
    if(!line) {
        output += NEW_LINE; return;
    }
    output += line + NEW_LINE;
};
const write = text => {
    output += text;
};

writeLine(`/* Notice: This is an auto-generated file. Modifying it can have unexpected results! */`);

writeLine();

writeLine(`import ScriptBook from "./script-book.js"`);

writeLine();

const capitalize = (string,index,length) => {
    const part2Start = index + length;

    let part1 = string.substring(index,part2Start);
    part1 = part1.toUpperCase();

    let part2 = string.substring(part2Start);
    part2 = part2.toLowerCase();

    return part1 + part2;
};

const translateFileName = fileName => {
    const deadCaterpillar = fileName.split("-");
    let output = "";
    for(let i = 0;i<deadCaterpillar.length;i++) {
        const titlecase = capitalize(deadCaterpillar[i],0,1);
        output += titlecase;
    }
    return output;
};

const scriptList = new Array();

fs.readdirSync(INPUT_FOLDER).forEach(filePath => {
    const extension = path.extname(filePath);
    const fileName = path.basename(filePath,extension);

    const scriptName = translateFileName(fileName);
    writeLine(`import ${scriptName} from './${SCRIPT_FOLDER}${fileName}${extension}'`);
    
    scriptList.push(scriptName);
});

writeLine();

writeLine(`ScriptBook.Import(`);
for(let i = 0;i<scriptList.length;i++) {
    switch(i % 3) {
        case 2:
            writeLine(); 
        case 0:
            write(TAB);
        default:
            const name = scriptList[i]; write(name);
            if(i < scriptList.length-1) write(`,`);
            break;
    }
}
writeLine();
writeLine(`)`);
writeLine();

writeLine(`/* End of auto-generated file */`);

fs.writeFileSync(OUTPUT_PATH,output);
