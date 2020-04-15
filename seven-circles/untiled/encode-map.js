const INVERSE_CIPHER_LOOKUP = (function(inverse=true){
    const o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    n=o.length,c=Math.pow(n,2),r={};for(let e=0;e<c;e++)
    {const c=o[Math.floor(e/n)],f=o[e%n];inverse?r[e]=c+f:r[c+f]=e}return r;
})();

const tabulateLayer = layer => {
    const table = new Object();
    const emptyValue = INVERSE_CIPHER_LOOKUP[0];
    layer.forEach((value,index)=>{
        if(value === emptyValue) return;

        let target;
        if(value in table) {
            target = table[value];
        } else {
            target = new Array();
            table[value] = target;
        }

        target.push(index);
    });
    Object.entries(table).forEach(([type,indices])=>{
        if(indices.length === 1) {
            table[type] = indices[0];
        }
    });
    return table;
};

const strideEncodeLayer = layer => {
    const stream = new Array();
    let streamValue = layer[0];
    let count = 1;
    
    for(let i = 1;i<layer.length;i++) {
        const value = layer[i];
        if(value === streamValue) {
            count++;
        } else {
            stream.push(streamValue,count);
            streamValue = value; count = 1;
        }
    }
    stream.push(streamValue,count);

    return stream;
};

const encodeLayer = layer => {
    let emptyCount = 0;
    const maxCount = layer.length;

    for(let i = 0;i<maxCount;i++) {
        if(layer[i] === 0) emptyCount++;
    }

    if(emptyCount === maxCount) {
        return null;
    }

    for(let i = 0;i < maxCount;i++) {
        const value = layer[i];
        layer[i] = INVERSE_CIPHER_LOOKUP[value];
    }

    const base64Layer = layer.join("");
    const tabulatedLayer = tabulateLayer(layer);
    const strideLayer = strideEncodeLayer(layer);

    let largestSet = [Infinity,null];
    [
      [JSON.stringify(tabulatedLayer).length,tabulatedLayer],
      [JSON.stringify(strideLayer).length,strideLayer],
      [base64Layer.length,base64Layer]
    ].forEach(set => {
        const length = set[0];
        if(length < largestSet[0]) {
            largestSet = set;
        }
    });

    return largestSet[1];
};

const EncodeMap = map => {
    map.background = encodeLayer(map.background);
    map.foreground = encodeLayer(map.foreground);
    map.superForeground = encodeLayer(map.superForeground);
    map.collision = encodeLayer(map.collision);
    map.interaction = encodeLayer(map.interaction);
    map.lighting = encodeLayer(map.lighting);
};

export default EncodeMap;
