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



class AudioVisualizer {
    constructor() {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.audioSource = null;
        this.data = new Uint8Array(this.analyser.frequencyBinCount);
        this.isPlaying = false;
        this.isPaused = false;
        this.buffer = null;
        this.audioStartTime = 0;
        this.pausedAt = 0;
        this.isStopped = false;
        this.audioPlayer = document.getElementById('audioPlayer');
        this.seekBar = document.getElementById('seekBar');
        this.setupEventListeners();
        this.loadDefaultTrack();
    }

    setupEventListeners() {
        document.getElementById('audioFile').addEventListener('change', this.handleFileChange.bind(this));
        document.getElementById('playButton').addEventListener('click', this.handlePlay.bind(this));
        document.getElementById('stopButton').addEventListener('click', this.handleStop.bind(this));
        this.audioPlayer.addEventListener('ended', this.handleAudioEnd.bind(this));
        this.seekBar.addEventListener('input', this.handleVolumeChange.bind(this));
    }

    loadDefaultTrack() {
        fetch('t2.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.buffer = audioBuffer;
                this.handlePlay();
            })
            .catch(e => console.error("Error loading default track:", e));
    }

    handlePlay() {
        if (this.audioSource) {
            this.audioSource.disconnect();
        }
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.buffer;
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        const offset = this.isPaused ? this.pausedAt - this.audioStartTime : 0;
        this.audioSource.start(0, offset);

        this.isPlaying = true;
        this.isPaused = false;
        this.isStopped = false;
        this.audioStartTime = this.audioContext.currentTime - offset;
        this.loop();
    }

    handleStop() {
        if (this.isPlaying || this.isPaused) {
            if (this.audioSource) {
                this.audioSource.stop();
                this.audioSource = null;
            }
            this.isPlaying = false;
            this.isPaused = false;
            this.audioStartTime = 0;
            this.pausedAt = 0;
            this.isStopped = true;
    
            particlesJS('particles-js', particlesInitialConfig);
        }
    }

    handleAudioEnd() {
        console.log("The audio track has ended, particles behavior is reset.");
        if (this.isPlaying) {
            this.isPlaying = false;
        }
        particlesJS('particles-js', particlesInitialConfig);
    }

    handleVolumeChange(event) {
        this.audioPlayer.volume = event.target.value / 100;
    }

    handleFileChange(e) {
        let file = e.target.files[0];
        if (!file.type.startsWith('audio')) {
            alert('Please select an audio file.');
            return;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            this.audioContext.decodeAudioData(e.target.result, (decodedBuffer) => {
                this.buffer = decodedBuffer;
                if (this.audioSource) {
                    this.audioSource.disconnect();
                }
                this.audioSource = this.audioContext.createBufferSource();
                this.audioSource.buffer = this.buffer;
                this.audioSource.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    loop() {
        if (!this.isStopped) {
            this.analyser.getByteFrequencyData(this.data);
    
            let pJS = window.pJSDom[window.pJSDom.length - 1].pJS;
    
            // Divide the frequency data into two halves
            let lowerHalfArray = this.data.slice(0, (this.data.length / 2) - 1);
            let upperHalfArray = this.data.slice((this.data.length / 2) - 1, this.data.length - 1);
    
            let lowerMax = this.max(lowerHalfArray);
            let upperAvg = this.arrayAverage(upperHalfArray);
    
            const lowerMaxNormalized = lowerMax / 256;
            const speedMultiplier = upperAvg / 256;
    
            for (let i = 0; i < pJS.particles.array.length; i++) {
                let particle = pJS.particles.array[i];
    
                const sizeMultiplier = 10;  // Increase the size multiplier
                const baseSpeed = 2;
    
                // Modify particle velocity based on the treble (upper frequencies)
                particle.vx = baseSpeed * speedMultiplier;
                particle.vy = baseSpeed * speedMultiplier;
    
                // Store original size in vm, if not already stored
                particle.vm = particle.vm || particle.radius;
    
                // Modify particle size according to the bass (lower frequencies)
                particle.radius = particle.vm * (1 + lowerMaxNormalized * sizeMultiplier);
    
                // Limit the minimum and maximum size of particles
                const maxSize = 20; // You can adjust this as needed
                const minSize = 1;  // You can adjust this as needed
                particle.radius = Math.min(maxSize, Math.max(minSize, particle.radius));
    
                // Adjust velocity to ensure it doesn't exceed maxSpeed
                let currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                let maxSpeed = 1;
                if (currentSpeed > maxSpeed) {
                    particle.vx = (particle.vx / currentSpeed) * maxSpeed;
                    particle.vy = (particle.vy / currentSpeed) * maxSpeed;
                }
            }
    
            if (this.isPlaying) {
                requestAnimationFrame(this.loop.bind(this));
            }
        }
    }    

    arrayAverage(array) {
        if (array.length === 0) return null;
        let sum = array.reduce((previous, current) => current += previous);
        return sum / array.length;
    }

    max(array) {
        return Math.max.apply(null, array);
    }
}



window.onload = () => {
    const visualizer = new AudioVisualizer();
    // The autoPlay function is called inside the constructor after loading the default track
};

// 

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

function resetExplanation() {
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


document.getElementById("closeButton").addEventListener("click", function () {
    resetExplanation();
});
