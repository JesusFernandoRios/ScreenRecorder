

// using the browsers built in media recorder to capture footage
let mediaRecorder;
const recordedChunks = [];

// buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick= getVideoSources;
startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};
stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};


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

    // creating the media recorder
    const options = {mimeType: 'video/webm; codecs=vp9'}
    mediaRecorder = new MediaRecorder(stream, options);

    // event handlers
    mediaRecorder.ondataavaliable = handleDataAvaliable;
    mediaRecorder.onstop = handleStop;
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

// captures all recorder chunks
function handleDataAvaliable(e) {

    console.log("video data avaliable")
    recordedChunks.push(e.data)
}

// this allows to create native dialog for saving and opening files
const { dialog } = remote;
const { writeFile } = require('fs')  

// save the video file on stop
async function handleStop(e) {
    //a blob is a data structure to handle raw data 
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from( await blob.arrayBuffer())

    const {filePath} = await dialog.showSaveDialog({
        buttonLabel: 'save Video',
        defaultPath: `vid-${Date.now()}.webm`
    })

    console.log(filePath)

    writeFile(filePath, buffer, () => console.log("video saved Successfully"))

}



