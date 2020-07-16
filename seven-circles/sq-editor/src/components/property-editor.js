import GetSafeColor from "./color-safety.js";
const element = document.getElementById("property-editor");
const propertyContainer = element.querySelector("div.properties");
const editorHeading = element.querySelector("h1");

import {KnownNames,KnownTypes} from "../property-parsing.js";

const ValidInputTypes = {
    "text": true, "number": true,
    "color": true, "checkbox": true
};

const addPropertyWatcher = (world,object,property,handler) => {
    const ID = object.addPropertyWatcher(property,handler);
    world.propertyWatchers.push({ID,object,property});
};

const clearProperties = world => {
    element.classList.add("hidden");
    if(world.panelUpdaterID !== null) {
        world.dispatchRenderer.removeFinalize(world.panelUpdaterID);
        world.panelUpdaterID = null;
    };
    while(propertyContainer.lastChild) {
        propertyContainer.removeChild(propertyContainer.lastChild);
    }
    for(const {ID,object,property} of world.propertyWatchers) {
        object.removePropertyWatcher(property,ID);
    }
    world.propertyWatchers.splice(0);
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

    addPropertyWatcher(
        world,object,key,updatePropertyDisplay
    );
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
        editorHeading.textContent = object.type || "Properties";
        const updateLocation = () => {
            const location = world.grid.getLocation(
                object.x + object.self.width / 2,object.y + object.self.height
            );
            element.style.left = Math.floor(location.x) + "px";
            element.style.top = Math.floor(location.y) + "px";
        };
        world.panelUpdaterID = world.dispatchRenderer.addFinalize(updateLocation);
    }
};

function InstallPropertyEditor(world) {
    let item = null, hasItem = false;
    world.propertyWatchers = [];
    world.selectionChanged = newItem => {
        item = newItem;
        hasItem = item !== null;

        clearProperties(world);
        if(hasItem) installProperties(item);
    };
}
export default InstallPropertyEditor;
