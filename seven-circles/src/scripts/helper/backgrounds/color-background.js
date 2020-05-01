function AddColorBackground(world,color) {
    const render = (()=>{
        const {context,size} = Eleven.CanvasManager;
        const render = () => {
            context.fillStyle = color;
            context.fillRect(0,0,size.width,size.height);
        };
        return render;
    })();
    world.dispatchRenderer.addBackground(render);
}
export default AddColorBackground;
