particlesJS('particles-js', {

    fpsLimit: 120,

    interactivity: {
        detect_on: 'canvas',
        events: {
            onClick: {
                enable: true,
                mode: "push",
            },
            resize: true,
        },
        modes: {
            grab: { distance: 400, line_linked: { opacity: 1 } },
            bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
            repulse: { distance: 200, duration: 0.4 },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 },
        },
    },
    particles: {
        color: {
            value: ["#000000", "#1a365d", "#881c24", "#b7b7b7"],
        },
        links: {
            color: "#ffffff",
            distance: 200,
            enable: true,
            opacity: 0.1,
            width: 1,
        },
        move: {
            direction: "none",
            enable: true,
            outModes: {
                default: "bounce-horizontal",
            },
            random: false,
            speed: 5,
            straight: false,
        },
        number: {
            density: {
                enable: true,
                area: 1000,
            },
            value: 80,
        },
        opacity: {
            value: 0.5,
        },
        shape: {
            type: ["square", "circle", "triangle"],
        },
        size: {
            value: { min: 1, max: 5 },
        },
    },
    retina_detect: true,
});

var audioContext = new AudioContext();
var analyser = audioContext.createAnalyser();
var audioSource = null;
var data = new Uint8Array(analyser.frequencyBinCount);
var isPlaying = false;

function loop() {
    analyser.getByteFrequencyData(data);
    var pJS = window.pJSDom[0].pJS;
    for (let i = 0; i < pJS.particles.array.length; i++) {
        let particle = pJS.particles.array[i];
        particle.radius = data[i % data.length] / 20;
    }
    if (isPlaying) {
        requestAnimationFrame(loop);
    }
}

document.getElementById('audioFile').addEventListener('change', function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        audioContext.decodeAudioData(e.target.result, function (buffer) {
            if (audioSource != null) {
                audioSource.disconnect();
            }
            audioSource = audioContext.createBufferSource();
            audioSource.buffer = buffer;
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);
        });
    };
    reader.readAsArrayBuffer(file);

    var audioPlayer = document.getElementById('audioPlayer');
    var seekBar = document.getElementById('seekBar');

    audioPlayer.ontimeupdate = function () {
        var value = (100 / audioPlayer.duration) * audioPlayer.currentTime;
        seekBar.value = value;
    }

    seekBar.addEventListener("change", function () {
        var currentTime = audioPlayer.duration * (seekBar.value / 100);
        audioPlayer.currentTime = currentTime;
    });
});

document.getElementById('playButton').addEventListener('click', function () {
    if (!isPlaying && audioSource) {
        audioSource.start(0);
        isPlaying = true;
        loop();
    }
});

document.getElementById('pauseButton').addEventListener('click', function () {
    if (isPlaying) {
        audioSource.stop();
        isPlaying = false;
    }
});

document.getElementById('stopButton').addEventListener('click', function () {
    if (isPlaying) {
        audioSource.stop();
        audioSource = null;
        isPlaying = false;
    }
});