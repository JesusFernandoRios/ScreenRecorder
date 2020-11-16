
// buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick= getVideoSources;


// electron built in video capture
const {desktopCapturer, remote} = require('electron')

const { Menu } = remote;

async function selectSource(source) {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory:{
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    }

    // creating a stream
    const stream = await navigator.mediaDevices.getUserMedia(
        constraints
    )

    // how to preview the source on the video element
    videoElement.srcObject = stream;
    videoElement.play();
}

// Get avaliable video sources
async function getVideoSources() {

    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    )

    videoOptionsMenu.popup();
}


