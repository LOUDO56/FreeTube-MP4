
const ytdl = require('ytdl-core');

const getQualities = async (yt_link) => {
    let quality_avalaible;
    try {
        quality_avalaible = {};
        let info = await ytdl.getInfo(yt_link);
        let formats = ytdl.filterFormats(info.formats, 'videoonly');
        formats.forEach(format => {
            if(format.itag <= 337)
                if(quality_avalaible[format.qualityLabel] === undefined){
                    quality_avalaible[format.qualityLabel] = format.itag
                }
        });
    } catch (error) {
        return quality_avalaible = null
    }
    return quality_avalaible
}


const getInfoVideo = async (yt_link) => {
    let info = await ytdl.getInfo(yt_link);
    return info.videoDetails
}


module.exports = { getQualities, getInfoVideo };
