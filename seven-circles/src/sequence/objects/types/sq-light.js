import Shorthand from "../shorthand.js";
import OptionGen from "../option-gen.js";

const SQLight = {
    width: 1, height: 1,

    defaults: `{"x":0,"y":0,"gradientID":7}`,

    create: ({world,self},data) => {
        const {x,y,gradientID} = data;
        const sprite = new Eleven.LightSprite(x,y);
        sprite.gradientID = gradientID;
        world.spriteLayer.add(sprite,50);
        self.sprite = sprite;
    },
    delete: Shorthand.SpriteDeleter,

    properties: {
        x: Shorthand.XYProp, y: Shorthand.YProp,
        gradientID: OptionGen("gradientID",{
            "White": 7, "Beige": 11,
            "Yellow": 12, "Red": 9,
            "Green": 10, "Purple": 13,
            "Blue": 8, "Cerise": 14
        })
    }
};

export default SQLight;
