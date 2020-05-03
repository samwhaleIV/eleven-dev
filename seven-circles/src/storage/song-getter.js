const INTRO_EXTENSION = "_intro";
const FULL_EXTENSION = "_full";
const LOOP_EXTENSION = "_loop";
const MUSIC_PATH = "music";

const {ResourceManager,AudioManager} = Eleven;

async function GetSong(name) {
    name = `${MUSIC_PATH}/${name}`;
    const song_full = name + FULL_EXTENSION;

    const hasFullSong = ResourceManager.hasAudio(song_full);
    if(hasFullSong) return ResourceManager.getAudio(song_full);

    const song_intro = name + INTRO_EXTENSION;
    const song_loop = name + LOOP_EXTENSION;

    ResourceManager.queueAudio(song_intro);
    ResourceManager.queueAudio(song_loop);

    await ResourceManager.load();

    const introBuffer = ResourceManager.getAudio(song_intro);
    const loopBuffer = ResourceManager.getAudio(song_loop);

    ResourceManager.setAudio(song_full,AudioManager.mergeBuffers(
        introBuffer,loopBuffer
    ));
    ResourceManager.removeAudio(song_intro,song_loop);

    return ResourceManager.getAudio(song_full);
}
export default GetSong;
