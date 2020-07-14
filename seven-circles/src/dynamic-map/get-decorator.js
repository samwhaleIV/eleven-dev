import DecoratorBuffer from "./decorator-buffer.js";
import RenderImage from "./image-renderer.js";
import Operations from "./operations.js";
import Template from "./template.js";

const BAD_LAYER = ID => {
    throw Error(`Invalid template layer '${ID}'! It must be one of the 6 basic composite colors: ID 0 through 5.`);
};
const BAD_OPERATION = name => {
    throw Error(`'${name}' is an invalid map decorator operation!`);
};

function GetDecorator(operations) {
    return image => {
        const template = new Template(image);
        const decoratorBuffer = new DecoratorBuffer(template);
        for(const [operationName,...parameters] of operations) {

            const operation = Operations[operationName];
            if(!operation) {
                BAD_OPERATION(operationName);
                continue;
            };

            if(operation.isLayerless) {
                operation(decoratorBuffer,...parameters);
                continue;
            }

            const layerID = parameters.shift();

            const layer = template.readChannel(layerID);
            if(!layer) BAD_LAYER(layerID);
    
            const privateData = {buffer: decoratorBuffer,layerID,layer};
            operation(privateData,...parameters);
        }
        image = RenderImage(decoratorBuffer);
        return {image,tileCollision:decoratorBuffer.tileCollision};
    };
}
export default GetDecorator;
