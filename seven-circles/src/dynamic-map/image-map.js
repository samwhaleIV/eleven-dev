import {GetColorID, ColorTable} from "./colors.js";

function GetImageMap(image) {
    const {width,height} = image;

    let extraWidth = 0, extraHeight = 0;

    if(width !== height) {
        if(width > height) {
            extraHeight = width - height;
        } else {
            extraWidth = height - width;
        }
    }

    const buffer = new OffscreenCanvas(
        width + extraWidth,height + extraHeight
    );
    const context = buffer.getContext("2d",{alpha:true});

    Object.assign(context,{
        imageSmoothingEnabled: false,
        imageSmoothingQuality: "high"
    });

    context.drawImage(
        image,0,0,width,height,
        0,0,width,height
    );

    const imageData = context.getImageData(
        0,0,buffer.width,buffer.height
    );
    const {data} = imageData;
    const R = 0, G = 1, B = 2;

    const pixelCount = data.length / 4;
    const map = new Array(pixelCount);

    const channels = new Array(ColorTable.length);
    for(let i = 0;i<channels.length;i++) {
        channels[i] = new Array(0);
    }

    const getColorID = index => {
        const pixel = index * 4;
        return GetColorID(
            data[pixel+R],data[pixel+G],data[pixel+B]
        );
    };

    for(let i = 0;i<pixelCount;i++) {
        const colorID = getColorID(i);
        channels[colorID].push(i);
        map[i] = colorID;
    }

    return {
        width: buffer.width,height: buffer.height,
        image, map, buffer, context, channels, imageData
    };
}
export default GetImageMap;
