const XProp = {
    type: "number",
    get: ({self}) => {
        return self.sprite.x;
    },
    set: ({self},value) => {
        self.sprite.x = value;
    }
};
const YProp = {
    type: "number",
    get: ({self}) => {
        return self.sprite.y;
    },
    set: ({self},value) => {
        self.sprite.y = value;
    }
};

const ColorProp = {
    get: ({self}) => {
        return self.sprite.color
    },
    set: ({self},value) => {
        self.sprite.color = value;
    }
};

const GetBoolProp = name => {
    return {
        type: "checkbox",
        get: ({self}) => {
            return self.sprite[name];
        },
        set: ({self},value) => {
            self.sprite[name]= value;
        }
    };
};

const SpriteDeleter = ({world,self}) => {
    world.spriteLayer.remove(self.sprite.ID);
};

const Shorthand = {
    XProp,YProp,SpriteDeleter,ColorProp,GetBoolProp
};
export default Shorthand;
