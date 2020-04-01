const fs = require("fs");
const path = require("path");

const NEW_LINE = "\n";
const TAB = `    `;

const MANIFEST_FILE = "manifest.js";

const SCRIPT_ROOT = "../src/scripts/";
const SCRIPT_FOLDER = "main/";

const INPUT_FOLDER = SCRIPT_ROOT + SCRIPT_FOLDER;
const OUTPUT_PATH = SCRIPT_ROOT + MANIFEST_FILE;

const IMPORT_NEW_LINE_RATE = 8;

let output = "";
const writeLine = line => {
    if(!line) {
        output += NEW_LINE; return;
    }
    output += line + NEW_LINE;
};
const writeImportLine = (importName,path) => {
    writeLine(`import ${importName} from "./${path}";`);
};
const write = text => {
    output += text;
};

writeLine(`/* Notice: This is an auto-generated file. Modifying it can have unexpected results! */`);

writeLine();

writeImportLine("ScriptBook","script-book.js");

writeLine();

const capitalize = (string,index,length) => {
    const part2Start = index + length;

    let part1 = string.substring(index,part2Start);
    part1 = part1.toUpperCase();

    let part2 = string.substring(part2Start);
    part2 = part2.toLowerCase();

    return part1 + part2;
};

const getScriptName = fileName => {
    /*
      This is only an approximation of the script name.

      The true script identifier can be counter-specified in the function declaration itself.

      Most of the time it will be the same if the developer follows the naming convention.
    */

    fileName = fileName.replace(/\s/g,"");
    const deadCaterpillar = fileName.split("-");
    let output = "";
    for(let i = 0;i<deadCaterpillar.length;i++) {
        const titlecase = capitalize(deadCaterpillar[i],0,1);
        output += titlecase;
    }
    return output;
};

const scriptList = new Array();

writeLine("/* Note that these import aliases might not reflect the real script identifier/function names. */");

fs.readdirSync(INPUT_FOLDER).forEach(filePath => {
    const extension = path.extname(filePath);
    const fileName = path.basename(filePath,extension);

    const scriptName = getScriptName(fileName);
    writeImportLine(scriptName,SCRIPT_FOLDER + fileName + extension);
    
    scriptList.push(scriptName);
});

writeLine();

writeLine(`const Scripts = ScriptBook.Import(`);
for(let i = 0;i<scriptList.length;i++) {
    switch(i % IMPORT_NEW_LINE_RATE) {
        case IMPORT_NEW_LINE_RATE - 1:
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
writeLine(`);`);
writeLine();

writeLine(`export default Scripts;`);

writeLine();
writeLine(`/* End of auto-generated file */`);

fs.writeFileSync(OUTPUT_PATH,output);
