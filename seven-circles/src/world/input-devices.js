import InputCodes from "./input-codes.js";

const {Up, Down, Left, Right, Click} = InputCodes;
const {ManagedGamepad, KeyBind} = Eleven;

function GetInputDevices() {
    const keyBind = new KeyBind({
        "KeyW": Up,
        "KeyS": Down,
        "KeyA": Left,
        "KeyD": Right,
        "Enter": Click,
        ArrowUp: Up,
        ArrowDown: Down,
        ArrowLeft: Left,
        ArrowRight: Right,
    });
    const managedGamepad = new ManagedGamepad({
        binds: {
            Up: Up,
            Down: Down,
            Left: Left,
            Right: Right,
            ButtonA: Click
        },
        whitelist: true,
        triggerThreshold: 0.1,
        repeatButtons: false,
        repeatAxes: false,
        repeatTriggers: false,
        repeatDelay: 200,
        repeatRate: 150,
        axisDeadzone: 0.7,
        manageLeftAxis: true,
        manageRightAxis: false,
        compositeLeftAxis: true,
        compositeRightAxis: false
    });
    return {keyBind, managedGamepad};
}

export default GetInputDevices;
