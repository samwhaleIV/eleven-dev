function InstallObjectBrowser(world) {

    world.setAction("toggle-browser",()=>{
        console.log("Toggle browser");
    });
    world.setAction("exit-browser",()=>{
        console.log("Exit browser");
    });

    //add a child frame to the world to view the new object

    //add a child frame to the world to paste in the new object, use clickDown to paste and finalize
}
export default InstallObjectBrowser;
