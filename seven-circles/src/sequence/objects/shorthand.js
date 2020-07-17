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
    const {sprite} = self; if(!sprite) return;
    world.spriteLayer.remove(sprite.ID);
};

const XYDefaults = `{"x":0,"y":0}`;
const XYProp = {x:XProp,y:YProp};

const LowestSize = 0.5;

const WidthProp = {
    type: "number",
    get: ({self}) => self.sprite.width,
    set: ({self},value) => {
        self.sprite.width = Math.max(value,LowestSize);
    }
};

const HeightProp = {
    type: "number",
    get: ({self}) => self.sprite.height,
    set: ({self},value) => {
        self.sprite.height = Math.max(value,LowestSize);
    }
};

const Directions = {
    "Up": 0, "Right": 1, "Down": 2, "Left": 3
};
const InverseDirections = {
    0: "Up", 1: "Right", 2: "Down", 3: "Left"
};
const DirectionList = ["Down","Right","Up","Left"]

const DirectionProp = {
    options: DirectionList,
    set: ({self},value) => {
        const {sprite} = self;
        if(typeof value === "number") {
            sprite.direction = Math.min(Math.max(value,0),3);
        } else {
            let newValue = Directions[value];
            if(isNaN(newValue)) newValue = 0;
            sprite.direction = newValue;
        }
    },
    get: ({self}) => {
        const direction = InverseDirections[self.sprite.direction];
        return direction;
    }
};

const Shorthand = {
    XProp,YProp,SpriteDeleter,XYProp,
    ColorProp,GetBoolProp,XYDefaults,
    WidthProp,HeightProp,DirectionProp
};

export default Shorthand;
