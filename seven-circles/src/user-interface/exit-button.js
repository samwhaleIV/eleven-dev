function GetExitButton(callback) {
    const button = document.createElement("div");
    button.className = "button";
    button.onclick = event => {
        if(event.button === 0) callback();
    };
    const text = document.createElement("p");
    text.appendChild(document.createTextNode("Close Menu"));
    button.appendChild(text);
    return button;
}
export default GetExitButton;
