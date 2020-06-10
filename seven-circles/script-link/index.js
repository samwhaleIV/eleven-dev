const fs = require("fs");
const path = require("path");

const NEW_LINE = "\n";
const MANIFEST_FILE = "manifest.js";

const SCRIPT_ROOT = "../src/scripts/";
const SCRIPT_FOLDER = "levels/";

const EXCLUSION_FILES = {"helper":true};

const INPUT_FOLDER = SCRIPT_ROOT + SCRIPT_FOLDER;
const OUTPUT_PATH = SCRIPT_ROOT + MANIFEST_FILE;

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
const write = text => output += text;

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

const addScripts = (directory,subfolder="") => {
    const files = fs.readdirSync(directory);
    files.forEach(filePath => {

        const fullPath = path.join(directory,filePath);

        if(fs.lstatSync(fullPath).isDirectory()) {
            addScripts(fullPath,`${subfolder}${filePath}/`);
            writeLine();
            return;
        }

        const extension = path.extname(filePath);
        const fileName = path.basename(filePath,extension);

        const scriptName = getScriptName(fileName);
        if(EXCLUSION_FILES[scriptName.toLowerCase()]) return;

        writeImportLine(scriptName,SCRIPT_FOLDER + subfolder + fileName + extension);
        scriptList.push(scriptName);
    });
};

addScripts(INPUT_FOLDER);

write(`const Scripts = ScriptBook.Import(`);
write(scriptList.join(","));
writeLine(`);`);
writeLine();

writeLine(`export default Scripts;`);

writeLine();
writeLine(`/* End of auto-generated file */`);

fs.writeFileSync(OUTPUT_PATH,output);
