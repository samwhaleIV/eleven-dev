const Constants = Object.freeze({
    Namespace: "SVCC",

    PlayerSpeed: 3,
    NPCSpeed: 3,

    FaderDuration: 500,
    FakeLoadingTime: 500,

    DefaultCameraScale: 7,
    WorldUIScreenMargin: 8,

    TriggerTiles: 15,
    DevSaveFile: "dev-save",

    GlobalResourceFile: "global-preload",
    WorldPreloadFile: "script-preload-files",

    SaveStateAddress: "SVCC_SAVE_STATE_DATA",
    KeyBindAddress: "SVCC_KEY_BINDS",

    MusicVolumeKey: "SVCC_MUSIC_VOLUME",
    SoundVolumeKey: "SVCC_SOUND_VOLUME",

    MusicVolume: 0.4,
    SoundVolume: 1,

    MinVolume: 0,
    MaxVolume: 1,

    PlayerSprite: "player/default",
    GameStartScript: "HelloWorld",
    ErrorLevel: "ErrorPlace",

    MenuSong: "murder",

    LogTileUpdates: false,
    AutoSelectInventory: false,

    RetroResolution: {
        Width: 900,
        Height: 700
    }
});
export default Constants;
