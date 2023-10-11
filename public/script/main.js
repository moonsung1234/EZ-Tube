
let link_input = document.querySelector(".link_input");
let convert_button = document.querySelector(".convert_button");

let is_finish = true;

const TEXT_LIMIT = 15;
const idRegex = /^[a-zA-Z0-9-_]{11}$/;
const validQueryDomains = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'gaming.youtube.com',
]);

function is_url(url) {
    let url_regex = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

    return !!String(url).match(url_regex);
}

function cut(text) {
    if(text.length >= TEXT_LIMIT) {
        return text.slice(0, TEXT_LIMIT) + "...";
    }

    return text;
}

function validateID(id) {
    return idRegex.test(id.trim());
} 

function getURLVideoID(link) {
    let validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
    let parsed = new URL(link.trim());
    let id = parsed.searchParams.get('v');
    
    if(validPathDomains.test(link.trim()) && !id) {
        let paths = parsed.pathname.split('/');
        id = parsed.host === 'youtu.be' ? paths[1] : paths[2];

    } else if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
        throw Error('Not a YouTube domain');
    }

    if(!id) {
        throw Error(`No video id found: "${link}"`);
    }

    id = id.substring(0, 11);
    
    if (!validateID(id)) {
        throw TypeError(`Video id (${id}) does not match expected ` +
        `format (${idRegex.toString()})`);
    }
    return id;
};

function get_video_id(str) {
    const urlRegex = /^https?:\/\//;

    if (validateID(str)) {
        return str;
    } else if (urlRegex.test(str.trim())) {
        return getURLVideoID(str);
    } else {
        throw Error(`No video id found: ${str}`);
    }
}

// add ads
let ins = document.createElement('ins');
let scr = document.createElement('script');
var isMobile = /Mobi/i.test(window.navigator.userAgent);

if(isMobile) {
    ins.className = 'kakao_ad_area';
    ins.style = "display:none;";
    scr.async = 'true';
    scr.type = "text/javascript";
    scr.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    ins.setAttribute('data-ad-width', '320');
    ins.setAttribute('data-ad-height', '100');
    ins.setAttribute('data-ad-unit', "DAN-gknfxm2Afbby9wnS");
    
    document.querySelector('#ad').style.width = "320px";
    document.querySelector('#ad').appendChild(ins);
    document.querySelector('#ad').appendChild(scr);


} else {
    ins.className = 'kakao_ad_area';
    ins.style = "display:none;";
    scr.async = 'true';
    scr.type = "text/javascript";
    scr.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    ins.setAttribute('data-ad-width', '728');
    ins.setAttribute('data-ad-height', '90');
    ins.setAttribute('data-ad-unit', 'DAN-9uHnMSxbWt94qkdr');
    
    document.querySelector('#ad').style.width = "728px";
    document.querySelector('#ad').appendChild(ins);
    document.querySelector('#ad').appendChild(scr);

    console.log("ad create!");
}

// request chart
axios({
    url : location.href + "chart",
    method : "GET"
})
.then(res => {
    let data = res.data;
    
    let youtube_info = data.youtube;
    let melon_info = data.melon;
    
    let youtube_wrap = document.querySelector(".youtube_wrap");
    let melon_wrap = document.querySelector(".melon_wrap");
    let youtube_loading = document.querySelector(".youtube .loading");
    let melon_loading = document.querySelector(".melon .loading");

    let youtube_text = document.querySelectorAll(".youtube .music_info");
    let melon_text = document.querySelectorAll(".melon .music_info");
    let youtube_thumnail = document.querySelectorAll(".youtube .music_image img");
    let melon_thumnail = document.querySelectorAll(".melon .music_image img");

    for(let i=0; i<youtube_info.length; i++) {
        // chart title
        youtube_text[i].querySelector(".music_name").innerHTML = cut(youtube_info[i][0]);
        melon_text[i].querySelector(".music_name").innerHTML = cut(melon_info[i][0]); 

        // chart author
        youtube_text[i].querySelector(".music_maker").innerHTML = cut(youtube_info[i][1]);
        melon_text[i].querySelector(".music_maker").innerHTML = cut(melon_info[i][1]); 

        // chart thumbnail
        youtube_thumnail[i].src = youtube_info[i][2];
        melon_thumnail[i].src = melon_info[i][2];
    }

    youtube_loading.style.display = "none";
    melon_loading.style.display = "none";
    youtube_wrap.style.display = "block";
    melon_wrap.style.display = "block";
});

function convert_callback(e) {
    if(!is_finish) return;
    
    let url = link_input.value;
    let input_loading = document.querySelector(".input .loading");
    let input_video = document.querySelector(".video");

    if(!is_url(url)) {
        alert("Wrong URL!");

        input_video.style.display = "none";
        input_loading.style.display = "none";
        
        return;
    }

    is_finish = false;
    input_video.style.display = "none";
    input_loading.style.display = "flex";

    axios({
        url : location.href + "url",
        method : "POST",
        data : { url }
    })
    .then(res => {
        let data = res.data;
        let title = input_video.querySelector(".profile .profile_content");
        let thumbnail = input_video.querySelector(".image .thumbnail");
        let audio = input_video.querySelector(".mp3 .mp3_download");
        let video = input_video.querySelector(".mp4 .mp4_download");
        
        title.innerHTML = data.title;
        thumbnail.src = data.thumbnail;

        function audio_callback(e) {
            location.href = location.href + "download?format=mp3&id=" + get_video_id(url); //+ "&file=" + encodeURI(data.title);
        }

        audio.removeEventListener("click", audio_callback);
        audio.addEventListener("click", audio_callback);

        function video_callback(e) {
            location.href = location.href + "download?format=mp4&id=" + get_video_id(url); // + "&file=" + encodeURI(data.title);
        }

        video.removeEventListener("click", video_callback);
        video.addEventListener("click", video_callback);
    
        input_loading.style.display = "none";
        input_video.style.display = "flex";
        is_finish = true;
    });
}

link_input.addEventListener("keyup", e => e.keyCode == 13? convert_callback(e) : true);
convert_button.addEventListener("click", convert_callback);


