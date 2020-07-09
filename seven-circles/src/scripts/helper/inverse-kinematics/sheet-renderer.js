function GetSheetRenderer(
    image,baseSize,sheetX,sheetY,sheetWidth,sheetHeight,xOffset=0,yOffset=0
) {
    sheetX *= baseSize, sheetY *= baseSize;
    sheetWidth *= baseSize, sheetHeight *= baseSize;
    return (context,x,y,width,height) => {
        x += width * xOffset, y += height * yOffset;
        context.drawImage(image,sheetX,sheetY,sheetWidth,sheetHeight,x,y,width,height);
    };
}
export default GetSheetRenderer;
