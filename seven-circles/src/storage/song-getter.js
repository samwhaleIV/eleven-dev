const INTRO_EXTENSION = "_intro";
const FULL_EXTENSION = "_full";
const LOOP_EXTENSION = "_loop";
const MUSIC_PATH = "music";

const {ResourceManager,AudioManager} = Eleven;

async function TryLoadUndecoratedSong(
    name,extension,song_intro,song_loop,song_full
) {
    ResourceManager.queueAudio(name + extension);
    await ResourceManager.load();
    if(ResourceManager.hasAudio(name)) {
        const songBuffer = ResourceManager.getAudio(name);
        ResourceManager.removeAudio(song_intro,song_loop,name);
        ResourceManager.setAudio(song_full,songBuffer);
        return songBuffer;
    }
}

async function GetSong(name,extension) {
    extension = extension ? `.${extension}` : "";

    name = `${MUSIC_PATH}/${name}`;
    const song_full = name + FULL_EXTENSION;

    const hasFullSong = ResourceManager.hasAudio(song_full);
    if(hasFullSong) return ResourceManager.getAudio(song_full);

    const song_intro = name + INTRO_EXTENSION;
    const song_loop = name + LOOP_EXTENSION;

    ResourceManager.queueAudio(song_intro + extension);
    ResourceManager.queueAudio(song_loop + extension);

    await ResourceManager.load();

    const introBuffer = ResourceManager.getAudio(song_intro);
    const loopBuffer = ResourceManager.getAudio(song_loop);

    const hasIntro = ResourceManager.hasAudio(song_intro);
    const hasLoop = ResourceManager.hasAudio(song_loop);

    let bufferCount = 0;
    if(hasIntro) bufferCount += 1; if(hasLoop) bufferCount += 1;

    if(bufferCount === 0) {
        const song = TryLoadUndecoratedSong(
            name,extension,song_intro,song_loop,song_full
        );
        if(song) return song;
    }

    const hasSingleBuffer = bufferCount === 1;

    const finalBuffer = hasSingleBuffer ?
            hasIntro ? introBuffer : loopBuffer:
            AudioManager.mergeBuffers(introBuffer,loopBuffer);

    ResourceManager.setAudio(song_full,finalBuffer);
    ResourceManager.removeAudio(song_intro,song_loop);
    return ResourceManager.getAudio(song_full);
}
export default GetSong;
