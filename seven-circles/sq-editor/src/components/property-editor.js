import GetSafeColor from "./color-safety.js";
const element = document.getElementById("property-editor");
const propertyContainer = element.querySelector("div.properties");
const editorHeading = element.querySelector("h1");

import {KnownNames,KnownTypes} from "../property-parsing.js";

const ValidInputTypes = {
    "text": true, "number": true,
    "color": true, "checkbox": true,
    "options": true
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
    const {name} = data;
    if(name) {
        return name;
    } else if(key in KnownNames) {
        return KnownNames[key];
    }
    return key.charAt(0).toUpperCase() + key.slice(1);
};
const getPropertyType = (key,data,object) => {
    if(data.options) return "options";
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

const setObjectPropertySafely = (world,object,property,value) => {
    const oldValue = object.getProperty(property);
    object.setProperty(property,value);
    const newValue = object.getProperty(property);
    if(oldValue === newValue) {
        return false;
    }
    world.addEvents([{
        oldValue, newValue, type: "property", property, object
    }]);
    return true;
};

const getInputProperty = (object,key,propertyType) => {
    const {world} = object.container;

    const input = document.createElement("input");
    input.setAttribute("type",propertyType);
    input.setAttribute("name",key);

    const valueProperty = propertyType === "checkbox" ? "checked" : "value";

    const updatePropertyDisplay = () => {
        let value = object.getProperty(key);
        if(propertyType === "color") {
            value = GetSafeColor(value);
        } else if(propertyType === "checkbox") {
            value = Boolean(value);
        } else if(propertyType === "number") {
            value = Number(value.toFixed(2));
        }
        input[valueProperty] = value;
    };

    input.addEventListener("change",event => {
        event.stopPropagation();
        let value = input[valueProperty];
        if(propertyType === "number") {
            value = Number(value);
        } else if(propertyType === "checkbox") {
            value = Boolean(value);
        }
        if(setObjectPropertySafely(world,object,key,value)) {
            updatePropertyDisplay();
        }
    });

    addPropertyWatcher(
        world,object,key,updatePropertyDisplay
    );
    updatePropertyDisplay(object.getProperty(key));

    return input;
};
const getSelectProperty = (object,key) => {
    const {world} = object.container;

    const options = object.self.properties[key].options;
    const element = document.createElement("select");
    element.setAttribute("name",key);
    const optionList = [];
    for(const option of options) {
        const optionElement = document.createElement("option");
        optionElement.setAttribute("value",option);
        optionElement.appendChild(document.createTextNode(option));
        element.appendChild(optionElement);
        optionList.push(optionElement);
    }

    const setSelection = () => {
        element.value = object.getProperty(key);
    };

    const sendSelection = () => {
        if(setObjectPropertySafely(world,object,key,element.value)) {
            setSelection();
        }
    };

    element.onchange = sendSelection;
    addPropertyWatcher(world,object,key,setSelection);
    setSelection();

    return element;
};

const getPropertyElement = (
    object,displayName,key,propertyType
) => {
    if(!(propertyType in ValidInputTypes)) return null;

    const wrapper = document.createElement("div");
    wrapper.className = "property";

    const inputLabel = document.createElement("label");
    inputLabel.appendChild(document.createTextNode(
        displayName
    ));
    inputLabel.setAttribute("for",key);
    wrapper.appendChild(inputLabel);

    const inputGenerator = propertyType === "options"
        ? getSelectProperty : getInputProperty;
    const input =  inputGenerator(
        object,key,propertyType
    );
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
            const {width,height} = object;
            const location = world.grid.getLocation(
                object.x + width / 2,object.y + height
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
