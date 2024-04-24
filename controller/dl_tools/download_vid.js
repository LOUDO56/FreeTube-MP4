const fs = require('fs');
const path = require('path');
const { setTimeout } = require('timers/promises');

const downloadYoutubeVideo = async (ref, qualityChoosen, yt_vid_name, uniqueID, res) => {

    if(fs.existsSync(path.join(__dirname, '..', '..', 'public', 'video_downloaded', uniqueID + '.mp4'))){
        return res.redirect('/');
    }
    const cp = require('child_process');
    const ytdl = require('ytdl-core');
    const ffmpeg = require('ffmpeg-static');

    // Get audio and video streams
    const audio = ytdl(ref, { quality: 'highestaudio' })
    const video = ytdl(ref, { quality: qualityChoosen })

    // Start the ffmpeg child process
    const ffmpegProcess = cp.spawn(ffmpeg, [
    // Remove ffmpeg's console spamming
    '-loglevel', '8', '-hide_banner',
    // Redirect/Enable progress messages
    '-progress', 'pipe:3',
    // Set inputs
    '-i', 'pipe:4',
    '-i', 'pipe:5',
    // Map audio & video from streams
    '-map', '0:a',
    '-map', '1:v',
    // Keep encoding
    '-c:v', 'copy',
    // Define output file
    path.join(__dirname, '..', '..', 'public', 'video_downloaded', uniqueID + '.mp4'),
    ], {
    windowsHide: true,
    stdio: [
        /* Standard: stdin, stdout, stderr */
        'inherit', 'inherit', 'inherit',
        /* Custom: pipe:3, pipe:4, pipe:5 */
        'pipe', 'pipe', 'pipe',
    ],
    });
    audio.pipe(ffmpegProcess.stdio[4]);
    video.pipe(ffmpegProcess.stdio[5]);

    ffmpegProcess.on('close', () => {
        const videoPath = path.join(__dirname, '..', '..', 'public', 'video_downloaded', uniqueID + '.mp4');
        fs.readFile(path.join(__dirname, '..', '..', 'public', 'download-finish.html'), 'utf-8', (err, data) => {
            if(err) throw new Error();

            return res.send(data.replace(
                '<input type="hidden" name="vid_output" value="">',
                `<input type="hidden" name="vid_output" value="${videoPath}">`
            ).replace(
                '<input type="hidden" name="vid_title" value="">',
                `<input type="hidden" name="vid_title" value="${yt_vid_name}">`
            ))
        });
    });

}

module.exports = { downloadYoutubeVideo };