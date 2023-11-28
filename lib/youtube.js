
let axios = require("axios");

function get_video_info(url, callback) {
  // video info
  axios.get(url)
  .then(res => {
    let json = JSON.parse(res.data.split("ytInitialData = ")[1].split(";</script>")[0]);
    let content = json.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer;
    let title = content.title.runs[0].text;
    
    // search info
    axios.get("https://www.youtube.com/results?search_query=" + encodeURI(title))
    .then(_res => {
      let _json = JSON.parse(_res.data.split("ytInitialData = ")[1].split(";</script>")[0]);
      let _content = _json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;

      for(let c of _content) {
        if(Object.keys(c).indexOf("videoRenderer") != -1) {
          _content = c.videoRenderer;          
          
          break;
        }
      }
      
      let thumbnail = _content.thumbnail.thumbnails[0].url;
      
      callback(title, thumbnail);
    })
    .catch(err => {
      console.error(err);
    });
  })
  .catch(err => {
    console.error(err);
  });
}


module.exports = {
  get_video_info
}
