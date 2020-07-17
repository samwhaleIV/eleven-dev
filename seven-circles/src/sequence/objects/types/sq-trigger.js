
import Shorthand from "../shorthand.js";

const EDITOR_COLOR = "#2ABC009F";

const Actions = {
    NextLevel: (data,world) => {
        if(data.isPlayer) world.transitionNext()
    },
    LastLevel: (data,world) => {
        if(data.isPlayer) world.transitionLast()
    },
    None: () => {}
};

const SQTrigger = {
    defaults: `{"x":0,"y":0,"action":"None","width":1,"height":1}`,
    thumbnail: "editor/trigger",

    width: 1, height: 1,

    create: ({world,isEditor,self},data) => {
        if(!data.action) data.action = "None";
        const sprite = Object.assign({},data);

        if(isEditor) {
            sprite.render = (context,x,y,width,height) => {
                context.fillStyle = EDITOR_COLOR;
                context.fillRect(x,y,width,height);
            };
        } else {
            sprite.collides = true;
            sprite.collisionType = Eleven.CollisionTypes.Trigger;

            sprite.trigger = data => {
                const action = Actions[sprite.action];
                if(!action) return;
                action(data,world);
                world.spriteLayer.remove(sprite.ID);
            };
        }
        self.sprite = sprite;
        world.spriteLayer.add(sprite,-10);
    },

    delete: Shorthand.SpriteDeleter,
    properties: {
        width: Shorthand.WidthProp, height: Shorthand.HeightProp,
        x: Shorthand.XProp, y: Shorthand.YProp,
        action: Shorthand.OptionGen("action",{
            "Next Level": "NextLevel", "Last Level": "LastLevel", "None": "None"
        })
    }
};

export default SQTrigger;
