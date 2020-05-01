const Constants = Object.freeze({
    Namespace: "SVCC",

    PlayerSpeed: 3,
    NPCSpeed: 3,

    DefaultCameraScale: 7,
    WorldUIScreenMargin: 8,

    TriggerTiles: 15,
    DevSaveFile: "dev-save",

    GlobalResourceFile: "global-preload",
    WorldPreloadFile: "script-preload-files",

    SaveStateAddress: "SVCC_SAVE_STATE_DATA",
    KeyBindAddress: "SVCC_KEY_BINDS",

    PlayerSprite: "player",
    GameStartScript: "HelloWorld",
    GamePreloadScript: "Preload",

    LogTileUpdates: false,
    AutoSelectInventory: false,

    RetroResolution: {
        Width: 900,
        Height: 700
    }
});
export default Constants;
