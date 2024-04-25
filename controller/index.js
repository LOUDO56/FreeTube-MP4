const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
const { getQualities, getInfoVideo } = require(path.join(__dirname, "dl_tools", "get_qualities.js"));
const { downloadYoutubeVideo } = require(path.join(__dirname, "dl_tools", "download_vid.js"));
app.use(express.static(path.join(__dirname, '..' , 'public')));
app.use(express.static(path.join(__dirname, '..' , 'public', 'assets')));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.listen(4000, () => {
	console.log("Server started at http://localhost:4000")
});

app.get('/', (req, res) => {
    res.send(fs.readFileSync(path.resolve('./public/index.html'), 'utf8'))
});



app.post('/download-mp4', async (req, res) => {
    const yt_link = req.body.yt_link;
    if(yt_link === "") return res.redirect('/')
    const qualities = await getQualities(yt_link);
    if(qualities === null) return res.redirect('/')
    const infoVideo = await getInfoVideo(yt_link);
    let titleVidRq = infoVideo.title;
    titleVidRq = titleVidRq.replace(/[^\w\s]/gi, ' ')
    const uniqueID = uuidv4();
    let selection = "";
    for(const [key, value] of Object.entries(qualities)){
        selection += `<option value="${value}">${key}</option>`;
    }
    fs.readFile(path.resolve('./public/download-mp4.html'), 'utf-8', (err, data) => {
        if(err) throw new Error();

        return res.send(
            data.replace(
            '<select name="itag" id="itag" class="w-[10em] bg-[#201F1F] px-5 py-2">',
            '<select name="itag" id="itag" class="w-[10em] bg-[#201F1F] px-5 py-2">'
            + selection +
            '</select>' +
            `<input type="hidden" name="yt_link" value="${yt_link}">`
        ).replace(
            '<p class="text-center text-2xl font-bold mb-10 w-80"></p>',
            `<p class="text-center text-2xl font-bold mb-10 w-80">${infoVideo.title}</p>`
        ).replace(
            '<img src="" alt="">',
            `<img src="https://i.ytimg.com/vi/${infoVideo.videoId}/mqdefault.jpg" alt="${infoVideo.videoId} thumbnail">`
        ).replace(
            '<input type="hidden" name="yt_vid_name" value="">',
            `<input type="hidden" name="yt_vid_name" value="${titleVidRq}">`
        ).replace(
            '<input type="hidden" name="uniqueID" value="">',
            `<input type="hidden" name="uniqueID" value="${uniqueID}">`
        ))

    });
});


app.post('/download-vid', (req, res) => {
    const yt_link = req.body.yt_link;
    const itag = req.body.itag;
    let yt_vid_name = req.body.yt_vid_name;
    const uniqueID = req.body.uniqueID
    downloadYoutubeVideo(yt_link, Number(itag), yt_vid_name, uniqueID, res);
    const videoPath = path.join(__dirname, '..', 'public', 'video_downloaded', uniqueID + '.mp4');
    setTimeout(() => {
        try {
            fs.unlinkSync(videoPath)
        } catch (error) {
            console.log('Error during removal of a file : ' + error)
            return res.redirect('/')
        }
    }, 3600000)
})


app.post('/dlvideo', (req, res) => {
    const videoPath = req.body.vid_output
    const videoName = req.body.vid_title
    res.download(videoPath, videoName)

})
