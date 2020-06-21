const WorldCanvasScale = 1;

const Constants = Object.freeze({
    Namespace: "SVCC",

    PlayerSpeed: 3,
    NPCSpeed: 3,

    FaderDuration: 500,
    FakeLoadingTime: 500,

    WorldCanvasScale,
    DefaultCameraScale: Math.ceil(7 * WorldCanvasScale),
    WorldUIScreenMargin: 8 * WorldCanvasScale,

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

    MenuSong: "menu",

    LogTileUpdates: false,
    AutoSelectInventory: false
});
export default Constants;
