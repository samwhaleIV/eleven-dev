function Chapter1End(data) {
    const {world,lifetime} = data;
    world.setMap("empty");
    this.start = () => {

        const container = lifetime.getContainer("PlayerPosition");
        container.set("scriptID","HelloWorld");

        lifetime.save();
        SVCC.Runtime.LoadMenu();
    };
}
export default Chapter1End;
