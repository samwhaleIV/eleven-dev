import World from "./world/world.js";
import InputServer from "./user-interface/input-server.js";
import SaveState from "./storage/save-state.js";
import Scripts from "./scripts/manifest.js";
import Constants from "./constants.js";
import Inventory from "./items/inventory.js";
import MainMenu from "./user-interface/main-menu.js";
import AudioMenu from "./user-interface/audio-menu.js";
import DevKeyBindMenu from "./user-interface/dev-keybinds.js";
import CustomPrompt from "./user-interface/custom-prompt.js";
import WorldPreload from "./scripts/world-preload.js";
import GetSong from "./storage/song-getter.js";

const SAVE_STATE_ADDRESS = Constants.SaveStateAddress;
const GLOBAL_PRELOAD = Constants.GlobalResourceFile;
const FADER_TIME = Constants.FaderDuration;
const MINIMUM_TRANSITION_TIME = Constants.FakeLoadingTime;
const WORLD_CANVAS_SCALE = Constants.WorldCanvasScale;

const MUSIC_VOLUME_KEY = Constants.MusicVolumeKey;
const SOUND_VOLUME_KEY = Constants.SoundVolumeKey;

const CLEAN_SLATE = "CleanSlate";
const CONTAINERS = "Containers";
const CONTAINER = "Container";

const DEFAULT_MUSIC_VOLUME = Constants.MusicVolume;
const DEFAULT_SOUND_VOLUME = Constants.SoundVolume;

const MAX_VOLUME = Constants.MaxVolume;
const MIN_VOLUME = Constants.MinVolume;

const {CanvasManager, ResourceManager, Fader, Faders, DOMInterface, AudioManager} = Eleven;

const DEV_SAVE = Constants.DevSaveFile;

const logScripts = () => {
    const scriptCount = Object.keys(Scripts).length;
    console.log(`%cLoaded ${scriptCount} script${scriptCount!==1?"s":""} from './scripts/manifest.js'`,"background: white; color: black",Scripts);
};

const getInputServer = () => {
    const inputServer = new InputServer();
    inputServer.addChangeListener(()=>{
        const {frame} = CanvasManager;
        if(!frame || !frame.refreshInput) return;
        frame.refreshInput(inputServer.getBinds());
    });
    return inputServer;
};

function LoadAudioSettings(runtime) {
    let soundVolume = localStorage.getItem(SOUND_VOLUME_KEY);
    let musicVolume = localStorage.getItem(MUSIC_VOLUME_KEY);

    if(soundVolume === null) {
        soundVolume = DEFAULT_SOUND_VOLUME;
    } else soundVolume = Number(soundVolume);

    if(musicVolume === null) {
        musicVolume = DEFAULT_MUSIC_VOLUME;
    } else musicVolume = Number(musicVolume);

    if(isNaN(soundVolume)) soundVolume = DEFAULT_SOUND_VOLUME;
    if(isNaN(musicVolume)) musicVolume = DEFAULT_MUSIC_VOLUME;

    soundVolume = Math.min(Math.max(soundVolume,MIN_VOLUME),MAX_VOLUME);
    musicVolume = Math.min(Math.max(musicVolume,MIN_VOLUME),MAX_VOLUME);

    runtime.soundVolume = soundVolume;
    runtime.musicVolume = musicVolume;
}
function InstallAudioSettings(runtime) {
    Object.defineProperties(runtime,{
        soundVolume: {
            set: value => {
                AudioManager.soundVolume = value;
                localStorage.setItem(SOUND_VOLUME_KEY,value);
            },
            get: () => AudioManager.soundVolume,
            enumerable: true
        },
        musicVolume: {
            set: value => {
                AudioManager.musicVolume = value;
                localStorage.setItem(MUSIC_VOLUME_KEY,value);
            },
            get: () => AudioManager.musicVolume,
            enumerable: true
        }
    });
    LoadAudioSettings(runtime);
}

function Runtime() {

    logScripts();

    this.SaveState = SaveState;

    const inputServer = getInputServer();
    this.InputServer = inputServer;

    const getFaderRenderer = () => Faders.Black;

    InstallAudioSettings(this);

    this.prompt = CustomPrompt;

    const setFrame = async ({
        frameConstructor = null, parameters = [], loadPromises = [],
        canvasScale = 1, fadeStart = null, song = null
    }) => {
        const faderRenderer = getFaderRenderer();
        const oldFrame = CanvasManager.frame;

        if(oldFrame) {
            const fader = new Fader(faderRenderer);
            oldFrame.child = fader;
            if(oldFrame.unload) oldFrame.unload();

            await Promise.all([
                fader.fadeOut(FADER_TIME),
                AudioManager.fadeOutMusicAsync(FADER_TIME)
            ]);
            AudioManager.stopMusic();
        }

        if(!CanvasManager.paused) {
            CanvasManager.paused = true;
            CanvasManager.markLoading();
        }

        inputServer.managedGamepad.reset();
        loadPromises.push(CanvasManager.setFrame(
            frameConstructor,parameters
        ));

        if(oldFrame) loadPromises.push(delay(MINIMUM_TRANSITION_TIME));

        CanvasManager.setScale(canvasScale);
        await Promise.all(loadPromises);
        if(song) {
            song = await GetSong(song);
            const remoteControl = AudioManager.playMusicLooping(song);
            if(oldFrame) remoteControl.fadeIn(FADER_TIME);
        }
        if(fadeStart) await fadeStart();

        const frame = CanvasManager.frame;

        if(CanvasManager.paused) {
            CanvasManager.paused = false;
            CanvasManager.markLoaded();
        }

        if(oldFrame) {
            const fader = new Fader(faderRenderer);
            frame.child = fader;
            await fader.fadeIn(FADER_TIME);
            frame.child = null;
        }
    };

    this.LoadWorld = async () => {
        await setFrame({
            frameConstructor: World,
            parameters: [WorldPreload],
            canvasScale: WORLD_CANVAS_SCALE
        });
        if(DEV) {
            globalThis.world = CanvasManager.frame;
            globalThis.inventory = this.Inventory;
        }
    };

    this.LoadMenu = async () => {
        await setFrame({
            frameConstructor: MainMenu,
            song: Constants.MenuSong
        });
    };

    const globalPreload = async () => {
        await ResourceManager.queueText(GLOBAL_PRELOAD + ".json").load();
        const manifest = ResourceManager.getText(GLOBAL_PRELOAD);
        await ResourceManager.queueManifest(manifest).load();
    };

    this.Start = async () => {
        console.log("Use 'index-dev.html', there is not a release candidate yet!");
        window.location.href += "index-dev.html"; return;
    };

    let inventory = null;

    Object.defineProperty(this,"Inventory",{
        get: () => inventory,
        enumerable: true
    });

    this.DevStart = async () => {
        await globalPreload();

        await ResourceManager.queueJSON(DEV_SAVE).load();

        const devSave = ResourceManager.getJSON(DEV_SAVE);

        if(!DEMO && devSave) {

            if(devSave[CLEAN_SLATE]) SaveState.hardReset();

            const container = devSave[CONTAINER];
            const containers = devSave[CONTAINERS];

            if(container && containers) {
                localStorage.setItem(SAVE_STATE_ADDRESS,JSON.stringify(
                    containers[container]
                ));
            }
        }

        SaveState.load();

        inventory = new Inventory();

        if(DEMO) {
            this.LoadMenu();
        } else {
            this.LoadWorld();
        }
    };

    const audioMenu = DOMInterface.getMenu(AudioMenu);
    this.ConfigAudio = () => audioMenu.show();

    const keyBindMenu = DOMInterface.getMenu(DevKeyBindMenu);
    this.ConfigKeyBinds = () => keyBindMenu.show();

    Object.freeze(this);
}
export default Runtime;
