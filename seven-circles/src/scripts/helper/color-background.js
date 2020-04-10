function AddColorBackground(world,color) {
    world.dispatchRenderer.addBackground((context,{width,height})=>{
        context.fillStyle = color;
        context.fillRect(0,0,width,height);
    });
}
export default AddColorBackground;
