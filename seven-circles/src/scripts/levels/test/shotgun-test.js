import {AddColorBackground,AddCrawler} from "../helper.js";

function ShotgunTest({world}) {
    world.setMap("shotgun-test");
    AddColorBackground(world,"#000000");
    const player = world.addPlayer(14,9);
    world.camera.padding = true;

    const crawlers = [
        AddCrawler(world,10,7),
        AddCrawler(world,14,4),
        AddCrawler(world,23,15),
        AddCrawler(world,3,2)
    ];
    crawlers[0].direction = "left";
    this.start = () => {
        return;
        for(const crawler of crawlers) {
            crawler.squareLoop(1 + Math.floor(Math.random()*2));
        }
    }
}
export default ShotgunTest;
