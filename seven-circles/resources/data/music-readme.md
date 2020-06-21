This file refers to how to use the suggested songs file [./suggested-songs.json](./suggested-songs.json).

Link to music folder: [../audio/music](../audio/music) (seven-circles/resources/audio/music)

1. Songs are located in the `resources/audio/music` folder. You can put more folders here, but be sure to include them in your links.

    - Example: Your song is located at `resources/audio/music/hell/my_song.ogg`. Link to `hell/my_song`.

2. If you do not include a `.ogg` type extension to your file names, the file type and extension `.ogg` is assumed.

    - Example: If your file is NOT an ogg file, you can specify that in a way such as `my_song.mp3`.

3. Intros and loops are automatically spliced together at runtime. Do not include the `_intro` and `_loop` extensions in your links in this JSON file.

    - Example: You have two files in the music bin. `my_song_intro.ogg` and `my_song_loop.ogg`. Link simply to `my_song`. The files will be scanned and stitched accordingly.

    - Example: If your song does not need or use intro and loop segments, don't worry about it. The song will still play and loop. Simply store the file in the music bin, such as `resources/music/subfolder/my_song.ogg` and link to `subfolder/my_song`.

4. Web autoplay policies are a major bitch. You may need to physically interact with the page before a song will actually start.

5. Level loads are paused until the song is loaded at least once for the level. `preloadSongs` is an array that can contain extra songs to load for this level. This is used for scripted event songs and loading a song ahead of time as to reduce load times for a later level. Don't worry about this one too much, leave it to the level designer.

6. If the next song to play is the same as the song is already playing, the previous instance continues playing.

7. You probably won't encounter this, but *bon't mix and match file extensions.*

    Example 1, mixed intro and loop file types:
    - **Good**: `my_song_intro.ogg` + `my_song_loop.ogg`
    - **Bad**: `my_song_intro.mp3` + `my_song_loop.ogg`

    Example 2, duplicate song names with different extensions:
    - **Good**: `my_song.mp3` and `my_other_song.mp3`
    - **Bad**: `my_song.mp3` and `my_song.ogg` (note the second file is ogg but its name is the same as the previous file!)