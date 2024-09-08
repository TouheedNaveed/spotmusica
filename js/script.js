
let songs;
let currfolder;
let currentsong = new Audio();
//Time getting in minuites and seconds function
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
//Getting all songs logic
async function getSongs(folder) {
    currfolder=folder;
    let a = await fetch(`http://127.0.0.1:5500/${currfolder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs=[];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1]);
        }
    }

    //Show all the song in the library playlist section
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML=" ";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert pbtn" src="img/music.svg" alt="" />
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Rj Bhatti</div>
                </div>
                <div class="playnow">
                    <img class="invert pbtn" src="img/play.svg" alt=""></li>`;
    }

    //Attach an event listener to each song

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector(".info > div").innerHTML.trim());
        })
    })
    return songs;
}
//Playing audio from this function
const playMusic = (track, pause = false) => {
    play.src="img/play.svg";
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML=response;

     
}
async function main() {
    //get all songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    //Display all the albums on the page 
    displayAlbums();


    //Attach an event listener to play ,previous and next song button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })
    //Listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100+"%";
    })

    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100 
        document.querySelector(".circle").style.left=percent+"%";
        currentsong.currentTime=((currentsong.duration)*percent)/100;
    })

    //Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0";
    })
    //Add event listener for cross btn
    document.querySelector(".cross").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-100%";
    })

    //Add event listener for prev and next

    previous.addEventListener("click",()=>{
        let index=songs.indexOf(currentsong.src.split("/").slice("-1")[0]);
        if((index-1)>=0)
        {
            playMusic(songs[index-1]);
        }
    })
    next.addEventListener("click",()=>{
        currentsong.pause();
        let index=songs.indexOf(currentsong.src.split("/").slice("-1")[0]);
        if(index < songs.length-1)
        {
            playMusic(songs[index+1]);
        }
    })
    //Volume change event listener
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentsong.volume=parseInt(e.target.value)/100;
        if(currentsong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volumehigh.svg");
        }
    })

    //aadd event listener to mute
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volumehigh.svg")){
            e.target.src=e.target.src.replace("volumehigh.svg","mute.svg");
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
            
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volumehigh.svg");
            currentsong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })
    //Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}
main();