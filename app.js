const particlesInitialConfig = {
    "particles": {
        "number": {
            "value": 50,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": ["#fc0303", "#fcdb03", "#039dfc", "#fc03ca", "#03fc20"]
        },
        "shape": {
            "type": ["circle", "edge", "triangle", "polygon"],
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            }
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 5, // Slightly smaller particles
            "random": true,
            "anim": {
                "enable": false,
                "speed": 80,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 300,
            "color": "#ffffff",
            "opacity": 0.2,
            "width": 2
        },
        "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "none"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 800,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 800,
                "size": 80,
                "duration": 2,
                "opacity": 0.8,
                "speed": 3
            },
            "repulse": {
                "distance": 400,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 1
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
};
particlesJS('particles-js', particlesInitialConfig);


let audioContext;
let analyser;
let audioSource = null;
let data;
let isPlaying = false;
let isPaused = false;
let buffer = null;
let audioStartTime = 0;
let pausedAt = 0;
let isStopped = false;

const audioPlayer = document.getElementById('audioPlayer');
const seekBar = document.getElementById('seekBar');

window.onload = () => {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    data = new Uint8Array(analyser.frequencyBinCount);
};

function setupFileListener() {
    document.getElementById('audioFile').addEventListener('change', handleFileChange);
}

function loop() {

    if(!isStopped){
    analyser.getByteFrequencyData(data);
    console.log(window.pJSDom, window.pJSDom.length - 1);
    let pJS = window.pJSDom[window.pJSDom.length - 1 ].pJS;

    // Divide the frequency data into two halves
    let lowerHalfArray = data.slice(0, (data.length / 2) - 1);
    let upperHalfArray = data.slice((data.length / 2) - 1, data.length - 1);

    let lowerMax = max(lowerHalfArray);
    let upperAvg = arrayAverage(upperHalfArray);

    let maxSpeed = 1;

    const lowerMaxNormalized = lowerMax / 256;
    if (!isPaused) {

        for (let i = 0; i < pJS.particles.array.length; i++) {
            let particle = pJS.particles.array[i];

            const sizeMultiplier = 10;  // Increase the size multiplier
            const speedMultiplier = upperAvg / 256;

            const baseSpeed = 2;
            particle.vx = baseSpeed * speedMultiplier;
            particle.vy = baseSpeed * speedMultiplier;

            particle.vm = particle.vm || particle.radius;

            // Modify particle size according to the bass (lower frequencies)
            particle.radius = particle.vm * (1 + lowerMaxNormalized * sizeMultiplier);

            // We need to limit the minimum and maximum size of particles
            const maxSize = 20; // You can adjust this as needed
            const minSize = 1;  // You can adjust this as needed
            particle.radius = Math.min(maxSize, Math.max(minSize, particle.radius));

            let currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (currentSpeed > maxSpeed) {
                particle.vx = (particle.vx / currentSpeed) * maxSpeed;
                particle.vy = (particle.vy / currentSpeed) * maxSpeed;
            }
        }
    }


    if (isPlaying) {
        requestAnimationFrame(loop);
    }
}
}


// A couple of helper functions
function arrayAverage(array) {
    if (array.length === 0) return null;
    let sum = array.reduce((previous, current) => current += previous);
    return sum / array.length;
}

function max(array) {
    return Math.max.apply(null, array);
}

function handleFileChange(e) {
    let file = e.target.files[0];
    // console.log(e.target.files)
    if (!file.type.startsWith('audio')) {
        alert('Please select an audio file.');
        return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
        audioContext.decodeAudioData(e.target.result, function (decodedBuffer) {
            buffer = decodedBuffer;
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




    seekBar.addEventListener("change", function () {
        let currentTime = audioPlayer.duration * (seekBar.value / 100);
        audioPlayer.currentTime = currentTime;
    });
}


function handlePlay() {
    if (!isPlaying && audioSource) {
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = buffer;
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);

        const offset = pausedAt - audioStartTime;
        audioSource.start(0, offset);

        isPlaying = true;
        isPaused = false;
        isStopped = false;
        audioStartTime = audioContext.currentTime - offset;

        loop();
    }
}

function handleStop() {
    if (isPlaying || isPaused) {
        if (audioSource) {
            audioSource.stop();
            audioSource = null;
        }
        isPlaying = false;
        isPaused = false;
        audioStartTime = 0;
        pausedAt = 0;
        isStopped = true;

        // Reset particles to initial configuration
        particlesJS('particles-js', particlesInitialConfig);
    }
}



function setupButtonListeners() {
    document.getElementById('playButton').addEventListener('click', handlePlay);
    document.getElementById('stopButton').addEventListener('click', handleStop);
}

audioPlayer.addEventListener('ended', function () {
    let pJS = window.pJSDom[window.pJSDom.length - 1].pJS;
    particlesJS('particles-js', particlesInitialConfig);

    console.log("The audio track has ended, particles behavior is reset.");
    // do something when the audio track has ended...
    if (isPlaying) {
        isPlaying = false;
    }
});

document.getElementById('volumeSlider').addEventListener('input', function () {
    audioPlayer.volume = this.value / 100;
});

setupFileListener();
setupButtonListeners();


const explanations = [
    "Welcome to the interactive explanation of the audio visualizer. This guide will walk you through the technical details and functioning of the application.",
    "The audio visualizer uses the Web Audio API, a high-level JavaScript API for processing and synthesizing audio in web applications.",
    "The visualizer responds to different frequencies of the audio file that you upload. Different frequencies will affect the motion and appearance of the particles in the visualization.",
    "How to use the visualizer: upload an audio file from your device by clicking upload button and choose the audio file you want to hear. Then press play button.",
    "If you want to stop the audio, press the stop button.",
];

function resetExplanation(){
    document.getElementById('explanationContainer').style.display = 'none';
        currentExplanationIndex = 0;
}

let currentExplanationIndex = 0;

function showExplanation() {
    document.getElementById('explanationContainer').style.display = 'block';
    document.getElementById('explanationText').innerText = explanations[currentExplanationIndex];
}

document.getElementById('explanationButton').addEventListener('click', showExplanation);

document.getElementById('nextButton').addEventListener('click', () => {
    currentExplanationIndex++;
    if (currentExplanationIndex >= explanations.length) {
        resetExplanation();
    } else {
        document.getElementById('explanationText').innerText = explanations[currentExplanationIndex];
    }
});


document.getElementById("closeButton").addEventListener("click", function() {
    resetExplanation();
});
