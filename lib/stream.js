
let ytdl = require("ytdl-core");

function get_stream(url, callback) {
    ytdl.getInfo(url)
    .then(info => {
        // audio
        let audio_format = ytdl.chooseFormat(info.formats, { quality : "highestaudio" });
        let audio_stream = ytdl(url, { filter : "audioonly" });

        // video
        let video_format = ytdl.chooseFormat(info.formats, { quality : "highest" });
        let video_stream = ytdl(url, { filter : "videoandaudio" });

        callback([audio_format, audio_stream], [video_format, video_stream]);
    });
}

exports.get_stream = get_stream;
