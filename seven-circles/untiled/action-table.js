const ActionTable = {
    repeat: {
        KeyW: "panUp",
        KeyA: "panLeft",
        KeyS: "panDown",
        KeyD: "panRight",
        KeyZ: "zoomIn",
        KeyX: "zoomOut",
        KeyF: "fillSelection",
    },
    ctrl: {
        KeyZ: "undo",
        KeyY: "redo",
        KeyR: "reloadTilesets",
        KeyS: "saveAndExport",
        KeyO: "openMap",
        KeyE: "runScript"
    },
    shift: {
        KeyQ: "resizeMap",
        Digit1: "toggleBackground",
        Digit2: "toggleForeground",
        Digit3: "toggleSuperForeground",
        Digit4: "toggleCollision",
        Digit5: "toggleInteraction",
        Digit6: "toggleLighting"
    },
    noRepeat: {
        Digit1: "selectBackground",
        Digit2: "selectForeground",
        Digit3: "selectSuperForeground",
        Digit4: "selectCollision",
        Digit5: "selectInteraction",
        Digit6: "selectLighting",
        KeyO: "allVisible",
        KeyP: "allInvisible",
        KeyG: "toggleGrid",
        KeyR: "toggleRandomMode",
        KeyB: "brushMode",
        KeyE: "eraserMode",
        KeyQ: "setLayerOnlyVisible"
    }
};
export default ActionTable;
