import GetSong from "../../storage/song-getter.js";

/* Video killed the radio star */

const {AudioManager,ResourceManager} = Eleven;

const songTable = {}, warnedSongs = {};

const FADE_IN_TIME = 300, FADE_OUT_TIME = 300, LONG_FADE_IN_TIME = 600;

const INVALID_SONG_NAME = name => {
    throw Error(`Song '${name}' from suggested-songs.json is invalid. Does it have more than one period?`);
};

function getDecoratedSongName(name) {
    if(!name) return null;
    name = name.split(".");
    const decoratedName = {name:name[0]};
    if(name.length === 1) {
        decoratedName.extension = null;
    } else if(name.length === 2) {
        decoratedName.extension = name[1];
    } else {
        INVALID_SONG_NAME(name);
    }
    return decoratedName;
}

function getSuggestedSongs() {
    const suggestedSongs = ResourceManager.getJSON("suggested-songs");
    const pureSongList = new Object();

    Object.entries(suggestedSongs).forEach(([scriptName,{song,preloadSongs}])=>{
        if(!preloadSongs) preloadSongs = new Array();
        song = getDecoratedSongName(song);
    
        const filteredPreloadSongs = [];
        for(const preloadSong of preloadSongs) {
            const decoratedSong = getDecoratedSongName(preloadSong);
            if(!decoratedSong) continue;
            filteredPreloadSongs.push(decoratedSong);
        }

        preloadSongs = filteredPreloadSongs;
        pureSongList[scriptName] = {song,preloadSongs};
    });

    return pureSongList;
}

async function playScriptSong(scriptName) {
    const {suggestedSongs} = this;
    const data = suggestedSongs[scriptName];
    if(!data || !data.song) {
        stopSong.call(this); return;
    }
    const {name,extension} = data.song;
    if(!(name in songTable)) {
        await loadSong(name,extension);
    }
    playSong.call(this,name);
}

async function trySongPreload(scriptName) {
    const {suggestedSongs} = this;
    if(!(scriptName in suggestedSongs)) return;
    const {preloadSongs} = suggestedSongs[scriptName];
    const loadPromises = [];
    for(const songData of preloadSongs) {
        if(!songData) continue;
        const {name,extension} = songData;
        loadPromises.push(loadSong(name,extension));
    }
    await Promise.all(loadPromises);
}

const SONG_NOT_LOADED = name => {
    if(warnedSongs[name]) return;
    console.warn("Cannot play song " + name + " because it was not loaded" +
        "(Or failed to load, check your logs)." +
        "Repeat instances of warnings for this song will be ignored."
    );
    warnedSongs[name] = true;
};

const fadeOutMusic = () => {
    AudioManager.fadeOutMusicAsync(FADE_OUT_TIME);
};
const playAndFadeIn = (song,longFade) => {
    const fadeTime = longFade ? LONG_FADE_IN_TIME : FADE_IN_TIME;
    AudioManager.playMusicLooping(song).fadeIn(fadeTime);
};

async function loadSong(name,extension) {
    if(name in songTable) return;
    const song = await GetSong(name,extension);
    songTable[name] = song;
}

async function stopSong() {
    const lastSong = this.activeSong;
    if(!lastSong) return;
    this.activeSong = null;
    await fadeOutMusic();
}

async function playSong(name) {
    const lastSong = this.activeSong;
    if(name === null) {
        await stopSong(); return;
    }
    let longFade = false;
    if(lastSong) {
        if(lastSong === name) return;
        await fadeOutMusic();
    } else {
        longFade = true;
    }
    this.activeSong = name;
    if(!(name in songTable)) {
        SONG_NOT_LOADED(name); return;
    }
    playAndFadeIn(songTable[name],longFade);
}

async function loadAndPlaySong(name,extension) {
    await loadSong.call(this,name,extension);
    await playSong.call(this,name);
}

export default {loadSong,playSong,stopSong,loadAndPlaySong,getSuggestedSongs,playScriptSong,trySongPreload};
