
let axios = require("axios");
let cheerio = require("cheerio");

function get_youtube_chart(limit, callback) {
    axios.get("https://www.youtube.com/playlist?list=PL4fGSI1pDJn5S09aId3dUGp40ygUqmPGc") 
    .then(res => {
        let json = JSON.parse(res.data.split("ytInitialData = ")[1].split(";</script>")[0]);
        let content = json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
        let result = [];

        for(let i=0; i<limit; i++) {
            let c = content[i].playlistVideoRenderer;
            let title = c.title.runs[0].text;
            let thumbnail = c.thumbnail.thumbnails[0].url;
            let author = c.shortBylineText.runs[0].text;
            
            result.push([title, author, thumbnail]);
        }
    
        callback(result);
    });
}

function get_melon_chart(limit, callback) {
    axios.get("https://www.melon.com/chart/index.htm")
    .then(res => {
        let $ = cheerio.load(res.data);
        let title = $(".lst50 td:nth-child(6) div > div > div.ellipsis.rank01 > span > a").map((i, e) => e.children[0].data);
        let author = $(".lst50 td:nth-child(6) div > div > div.ellipsis.rank02 > span > a").map((i, e) => e.children[0].data);
        let thumbnail = $(".lst50 td:nth-child(4) div > a > img").map((i, e) => e.attribs.src);
        let result = [];
        
        for(let i=0; i<limit; i++) {
            result.push([title[i], author[i], thumbnail[i]]);
        }

        callback(result);
    });

}

exports.get_youtube_chart = get_youtube_chart;
exports.get_melon_chart = get_melon_chart;
