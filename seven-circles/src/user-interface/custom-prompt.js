function GetPromptButton(text,type,callback) {
    const button = document.createElement("button");
    const buttonText = document.createTextNode(text);
    button.className = type;
    button.appendChild(buttonText);
    button.addEventListener("click",callback,true);
    return button;
}

function CustomPrompt(title,message,buttons,callback) {
    const target = document.body;

    const popup = document.createElement("div");
    popup.className = "popup";
    const callbackProxy = function(event) {
        const buttonCallbackID = event.currentTarget.callbackID;
        target.removeChild(popup);
        if(callback) callback(buttonCallbackID);
    }
    const innerPopup = document.createElement("div");
    innerPopup.className = "inner-popup";
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    const innerPopupText = document.createElement("div");
    innerPopupText.className = "inner-popup-text";
    
    const titleElement = document.createElement("h1");
    const messageElement = document.createElement("p");

    titleElement.appendChild(document.createTextNode(title));
    messageElement.appendChild(document.createTextNode(message));

    innerPopupText.appendChild(titleElement);
    innerPopupText.appendChild(messageElement);

    for(let i = 0;i<buttons.length;i++) {
        const button = buttons[i];
        const buttonElement = GetPromptButton(
            button.text,
            button.type,
            callbackProxy
        );
        buttonElement.callbackID = i;
        buttonContainer.appendChild(buttonElement);
    }

    innerPopup.appendChild(innerPopupText);
    innerPopup.appendChild(buttonContainer);
    popup.appendChild(innerPopup);

    target.appendChild(popup);
}
export default CustomPrompt;
