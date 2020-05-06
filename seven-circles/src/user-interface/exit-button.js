const CLOSE_TEXT = "X";

function GetExitButton(callback) {
    const button = document.createElement("div");
    button.className = "button";
    button.onclick = event => {
        if(event.button === 0) callback();
    };
    button.appendChild(document.createTextNode(CLOSE_TEXT));
    return button;
}
export default GetExitButton;
