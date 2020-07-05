import {
    AddFixedWaterBackground,Teleporter,GetSwitchDoors,KeyDoor,PickupField,Fissure,AntiPlayer,MessageChain
} from "../helper.js";
import ObjectiveText from "../../helper/other/objective-text.js";

function GraveHell({world,inventory}) {
    world.setMap("grave-hell");
    world.camera.padding = true;
    AddFixedWaterBackground(world,1,11,6,8);
    world.addPlayer(12.5,3.9375,"down");

    const objective = new ObjectiveText(world);
    objective.set("Find a way out!");

    const teleporter = new Teleporter(world,[[5,7,5,21]]);
    const switchDoors = GetSwitchDoors(world,[[12,24,"yellow",false]],[[14,16,"yellow"]]);
    const keyDoors = KeyDoor.getDoors(world,this,[[27,9,"verticalRed"]]);
    const pickupField = new PickupField(world,[[18,24,"red-key",1,true,false]]);
    const fissure = new Fissure(world,16,true);

    let coffinClicked;

    const antiPlayer = AntiPlayer(world,29,10,"left",()=>coffinClicked());
    const NPCController = antiPlayer.controller;

    const placePlayerInCoffin = () => {
        world.setForegroundTile(45,7,1220);
        world.setForegroundTile(46,7,1221);
        world.spriteLayer.remove(world.player.ID);
    };

    const shiftSpriteFollower = async (target,duration,zoom) => {
        const cameraTarget = [target.camX,target.camY];
        world.spriteFollower.disable();

        if(zoom) world.camera.zoomTo(12,duration);

        await world.camera.moveTo(
            cameraTarget[0],cameraTarget[1],duration
        );

        world.spriteFollower.target = target;
        world.spriteFollower.enable();
    };

    coffinClicked = async () => {
        world.playerController.lock();
        objective.close();
        await world.say("Your cooperation is deeply appreciated.");
        await delay(600);
        placePlayerInCoffin();
        await delay(1200);
        await shiftSpriteFollower(antiPlayer,1000,true);
        await delay(600);
        await NPCController.move(0,1);
        await delay(1000);
        antiPlayer.direction = "right";
        await delay(1000);

        world.setForegroundTile(45,6,0);
        world.setForegroundTile(46,6,0);

        world.setForegroundTile(45,7,641);
        world.setForegroundTile(46,7,642);


        await frameDelay(1000);

        const start = performance.now();
        world.dispatchRenderer.addFinalize((context,size,time)=>{
            const startAlpha = context.globalAlpha;
            context.globalAlpha = Math.min(Math.max((time.now - start) / 3000,0),1);
            context.fillStyle = "black";
            context.fillRect(0,0,size.width,size.height);
            context.globalAlpha = startAlpha;
        },1);

        await frameDelay(4000);

        await world.say("Lights out.");

        await frameDelay(2000);

        await world.say("Sweet dreams.");

        world.transitionNext();
    };

    this.unload = () => {
        inventory.clear("red-key");
    };
    this.unload();

    const fastSpeed = 3;
    const normalSpeed = antiPlayer.velocity;

    this.keyDoorOpened = async door => {
        if(door.color === "red") {
            world.playerController.lock();
            world.player.clearWeapon();
            inventory.clear("red-key");
            await delay(1000);
            shiftSpriteFollower(antiPlayer,500,false);
            await world.say("Did you forget about me already? I've been waiting for you.");
            await delay(600);
            antiPlayer.direction = "right";
            await delay(600);
            antiPlayer.velocity = fastSpeed;
            await NPCController.move(13,0);
            await frameDelay(1000);
            antiPlayer.velocity = normalSpeed;
            await shiftSpriteFollower(world.player,1000,false);
            world.playerController.unlock();
            objective.set("Go into the unsettling chamber.");
        }
    };

    this.start = () => {
        (async ()=>{
            await frameDelay(1000);
            await MessageChain(world,[
                "Hey! Stop!",
                "Don't you have any manners?",
                "You're not even going to say hello?",
                "You fell right into our trap.",
                "We spent all this time setting it up for you and this is the thanks we get?",
                "It's true what they say about you.",
            ]);
            await delay(1500);
            await world.say("Don't you want to know what they say about you?");
            await delay(1000);
            await world.say("I'll take that as a no.");
        })();
        return false;
    };

    let hadRedKeyForTrigger = false;
    let hadYellowSwitchTrigger = false;

    const foundYellowButton = async () => {
        await world.say("Hey! You found the yellow button. Nice job.");
        await delay(3000);
        await world.say("Annnnd you just keep ignoring us.");
        await delay(1000);
        await world.say("Is it too much to ask for even a simple conversation anymore?");
    };

    world.setTriggers([
        [2,async ()=>{
            world.playerController.lock();
            await world.say("What do you think? Too barbaric?");
            await delay(250);
            await shiftSpriteFollower(antiPlayer,500);
            await delay(500);
            await NPCController.move(0,-4);
            await delay(500);
            await NPCController.move(2,0);
            await delay(1000);
            antiPlayer.direction = "down";
            await delay(500);
            await shiftSpriteFollower(world.player,500);
            world.playerController.unlock();
        },true],
        [3,async () => {
            world.playerController.lock();
            await world.say("What do you think? Too cozy?");
            await frameDelay(1000);
            await NPCController.move(0,1);
            await frameDelay(1000);
            antiPlayer.direction = "right";
            await frameDelay(1000);
            await world.say("I think it's the perfect size for you.");
            await frameDelay(600);
            antiPlayer.direction = "left";
            await frameDelay(600);
            await world.say("They're one size fit all.");
            await frameDelay(600);
            antiPlayer.direction = "down";
            await frameDelay(1000);
            await world.say("All the others seemed to fit.");
            await frameDelay(1000);
            await NPCController.move(0,-1);
            await frameDelay(1000);
            antiPlayer.direction = "down";
            await frameDelay(800);
            await world.say("Let's not make this any harder than it needs to be.");
            await frameDelay(600);
            await world.say("Get in.");
            objective.set("Get in the coffin.");
            world.playerController.unlock();
        },true],
        [4,()=>{
            if(hadRedKeyForTrigger && hadYellowSwitchTrigger) return;
            if(!hadYellowSwitchTrigger && world.getCollisionTile(12,25)===0) {
                hadYellowSwitchTrigger = true;
                foundYellowButton();
            }
            if(!hadRedKeyForTrigger && inventory.has("red-key")) {
                hadRedKeyForTrigger = true;
                world.say("Hello. Goodbye. These are things that polite people say to each other.");
            }
        },false]
    ]);

    this.interact = data => {
        const {value} = data;
        switch(value) {
            case 17:
                world.say("End of the line.");
                return;
            case 18:
                world.say("It was nice having you around. Sometimes.");
                return
            case 19:
                coffinClicked();
                return;
            case 24:
                world.sayNamed("I used to know that guy. We still hang out sometimes.","Mysterious Lamp","r");
                return;
        }
        if(keyDoors.tryInteract(data)) return;
        if(pickupField.tryPickup(data)) return;
        if(switchDoors.tryInteract(data)) return;
        if(teleporter.tryInteract(data)) return;
        if(fissure.tryInteract(data)) return;
    };
}
export default GraveHell;
