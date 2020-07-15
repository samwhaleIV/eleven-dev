/* Thanks to https://stackoverflow.com/a/24390910 for the original implementation */

function ByteToHex(value) {
    return ("0"+value.toString(16)).slice(-2);
}

function GetSafeColor(unsafeColor) {
    const offscreenCanvas = new OffscreenCanvas(1,1);
    const context = offscreenCanvas.getContext("2d",{alpha:false});

    context.fillStyle = unsafeColor;
    context.fillRect(0,0,1,1);
    const {data} = context.getImageData(0,0,1,1);

    let r = data[0], g = data[1], b = data[2];
    r = ByteToHex(r), g = ByteToHex(g), b = ByteToHex(b);

    return `#${r}${g}${b}`;
}
export default GetSafeColor;
