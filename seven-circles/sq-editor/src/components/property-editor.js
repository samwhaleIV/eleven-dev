import GetSafeColor from "./color-safety.js";

const element = document.getElementById("property-editor");
const propertyContainer = element.querySelector("div.properties");

const KnownNames = {
    "x": "X",
    "y": "Y",
    "direction": "Direction",
    "color": "Color"
};

const KnownTypes = {
    "x": "number",
    "y": "number",
    "color": "color",
    "direction": "number"
};

let panelUpdaterID = null;

const propertyWatchers = [];
const addPropertyWatcher = (object,property,handler) => {
    const ID = object.watchProperty(property,handler);
    propertyWatchers.push({ID,object,property});
};

const clearProperties = world => {
    element.classList.add("hidden");
    if(panelUpdaterID !== null) {
        world.dispatchRenderer.removeFinalize(panelUpdaterID);
        panelUpdaterID = null;
    };
    while(propertyContainer.lastChild) {
        propertyContainer.removeChild(propertyContainer.lastChild);
    }
    for(const {ID,object,property} of propertyWatchers) {
        object.unwatchProperty(property,ID);
    }
    propertyWatchers.splice(0);
};
const getPropertyDisplayName = (key,data) => {
    if(data.name) {
        return data.name;
    } else if(key in KnownNames) {
        return KnownNames[key];
    }
    return key;
};
const getPropertyType = (key,data,object) => {
    if(data.type) return data.type;
    if(key in KnownTypes) return KnownTypes[key];
    switch(typeof object.getProperty(key)) {
        case "string":
            return "text";
        case "boolean":
            return "checkbox";
        case "number":
            return "number";
        default:
            return null;
    }
};


const ValidInputTypes = {
    "text": true,
    "number": true,
    "color": true,
    "checkbox": true
};

const getPropertyElement = (
    object,displayName,key,propertyType
) => {

    if(!(propertyType in ValidInputTypes)) return null;

    const {world} = object.container;

    const wrapper = document.createElement("div");
    wrapper.className = "property";

    const inputLabel = document.createElement("label");
    inputLabel.appendChild(document.createTextNode(
        displayName
    ));
    inputLabel.setAttribute("for",key);
    const input = document.createElement("input");
    input.setAttribute("type",propertyType);
    input.setAttribute("name",key);

    const valueProperty = propertyType === "checkbox" ? "checked" : "value";

    let recursionBreak = false;
    input.addEventListener("change",event => {
        event.stopPropagation();
        let value = input[valueProperty];
        if(propertyType === "number") {
            value = Number(value);
        } else if(propertyType === "checkbox") {
            value = Boolean(value);
        }
        world.addEvents([{
            type: "property", property: key, object, value
        }]);
    });

    const updatePropertyDisplay = newValue => {
        if(recursionBreak) {
            recursionBreak = false;
            return;
        }

        if(propertyType === "color") {
            newValue = GetSafeColor(newValue);
        } else if(propertyType === "checkbox") {
            newValue = Boolean(newValue);
        } else if(propertyType === "number") {
            newValue = Number(newValue.toFixed(2));
        }

        input[valueProperty] = newValue;
    };

    addPropertyWatcher(object,key,updatePropertyDisplay);
    updatePropertyDisplay(object.getProperty(key));

    wrapper.appendChild(inputLabel);
    wrapper.appendChild(input);

    return wrapper;
};

const installProperties = object => {
    const properties = object.getProperties();
    const {world} = object.container;

    let elementCount = 0;
    for(const [key,data] of properties) {
        const propertyType = getPropertyType(key,data,object);
        if(!propertyType) continue;
        const displayName = getPropertyDisplayName(key,data);

        const propertyElement = getPropertyElement(
            object,displayName,key,propertyType
        );
        if(!propertyElement) continue;

        propertyContainer.appendChild(propertyElement);
        elementCount += 1;
    }

    if(elementCount > 0) {
        element.classList.remove("hidden");
        const updateLocation = () => {
            const location = world.grid.getLocation(
                object.x + object.self.width / 2,object.y + object.self.height
            );
            element.style.left = Math.floor(location.x) + "px";
            element.style.top = Math.floor(location.y) + "px";
        };
        panelUpdaterID = world.dispatchRenderer.addFinalize(updateLocation);
        //updateLocation();
    }
};

function InstallPropertyEditor(world) {
    let item = null, hasItem = false;
    world.selectionChanged = newItem => {
        item = newItem;
        hasItem = item !== null;

        clearProperties(world);
        if(hasItem) installProperties(item);
    };

}
export default InstallPropertyEditor;
