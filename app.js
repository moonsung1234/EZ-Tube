
let youtube = require("./lib/youtube");
let chart = require("./lib/chart");
let stream = require("./lib/stream");

let https = require("https");
let crypto = require("crypto");
let path = require("path");
let express = require("express");
let app = express();

const start = Date.now()

function doRequest() {
    https.request('https://google.com', res => {
        res.on('data', () => {});
        res.on('end', () => {
            console.log('Request:', Date.now() - start)
        })
    })
    .end()
}

function doHash(){
    crypto.pbkdf2("a", "b", 100000, 512, 'sha512', () => {
        console.log("Hash:", Date.now() - start);
    })
}

process.env.UV_THREADPOOL_SIZE = 10;

doRequest();

doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();
doHash();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "view")));
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "view/main.html"));
});

app.post("/url", (req, res) => {
  let url = req.body.url;

  youtube.get_video_info(url, (title, thumbnail) => {
    res.send({ title, thumbnail, url });
  });
});

app.get("/chart", (req, res) => {
  chart.get_youtube_chart(7, y_result => {
    chart.get_melon_chart(7, m_result => {
      res.send({
        youtube : y_result,
        melon : m_result
      });
    });
  });
});

app.get("/download", (req, res) => {
  let url = "https://www.youtube.com/watch?v=" + req.query.id;
  let format = req.query.format; 
  let file = req.query.file;

  stream.get_stream(url, (audio, video) => {
    if(format == "mp3") {
      let [audio_format, audio_stream] = audio;
      
      res.writeHead(200, {
        "Content-Type" : "audio/mpeg",
        "Content-Disposition" : `attachment; filename="EZTube.mp3"`
      });

      audio_stream.pipe(res);

    } else if(format == "mp4") {
      let [video_format, video_stream] = video;
      
      res.writeHead(200, {
        "Content-Type" : "video/mp4",
        "Content-Disposition" : `attachment; filename="EZTube.mp4"`
      });

      video_stream.pipe(res);
    }
  });
});

app.listen(3000, () => {
    console.log("Server Run!");
});
