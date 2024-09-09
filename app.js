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
        // this.loadDefaultTrack();

    
        this.playlist = [
            'https://dl.dropboxusercontent.com/scl/fi/8km1bqcn5352t7ep4sapd/01.-STARGAZING.mp3?rlkey=mhdfkxqqm2lypqzq4w2xsnwrw&st=fb8lu7or&dl=0',
            'https://dl.dropboxusercontent.com/scl/fi/eyhxveg8ed9o89l9qvhg2/03.-SICKO-MODE.mp3?rlkey=o42gwx5ndu4tkawnjfku1cn5f&st=q6d6z2yb&dl=0'
        ];

        this.currentTrackIndex = 1;


        this.loadTrack(this.currentTrackIndex);

    }

    setupEventListeners() {
        document.getElementById('audioFile').addEventListener('change', this.handleFileChange.bind(this));
        document.getElementById('playButton').addEventListener('click', this.handlePlay.bind(this));
        document.getElementById('stopButton').addEventListener('click', this.handleStop.bind(this));
        this.audioPlayer.addEventListener('ended', this.handleAudioEnd.bind(this));
        this.seekBar.addEventListener('input', this.handleVolumeChange.bind(this));
    }

    handleFileChange(e) {
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


    loadTrack(trackIndex) {
        const trackUrl = this.playlist[trackIndex];
        fetch(trackUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.buffer = audioBuffer;
                this.handlePlay();
            })
            .catch(e => console.error("Error loading track:", e));
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

        this.audioSource.onended = this.handleAudioEnd.bind(this);

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
        console.log("Track ended. Loading next track.");
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentTrackIndex);
    }
    

    handleVolumeChange(event) {
        this.audioPlayer.volume = event.target.value / 100;
    }


    loop() {
        if (!this.isStopped && this.isPlaying) {
            this.analyser.getByteFrequencyData(this.data);

            let pJS = window.pJSDom[window.pJSDom.length - 1]?.pJS;

            if (pJS?.particles?.array) {
                let lowerHalfArray = this.data.slice(0, (this.data.length / 2) - 1);
                let upperHalfArray = this.data.slice((this.data.length / 2) - 1, this.data.length - 1);

                let lowerMax = this.max(lowerHalfArray);
                let upperAvg = this.arrayAverage(upperHalfArray);

                const lowerMaxNormalized = lowerMax / 256;
                const speedMultiplier = upperAvg / 256;

                for (let particle of pJS.particles.array) {
                    this.adjustParticle(particle, lowerMaxNormalized, speedMultiplier);
                }
            }
            requestAnimationFrame(this.loop.bind(this));
        }
    }


    adjustParticle(particle, lowerMaxNormalized, speedMultiplier) {
        const sizeMultiplier = 10;
        const baseSpeed = 2;
        const maxSize = 20;
        const minSize = 1;
        const maxSpeed = 1;

        particle.vx = baseSpeed * speedMultiplier;
        particle.vy = baseSpeed * speedMultiplier;

        particle.vm = particle.vm || particle.radius;
        particle.radius = particle.vm * (1 + lowerMaxNormalized * sizeMultiplier);
        particle.radius = Math.min(maxSize, Math.max(minSize, particle.radius));

        let currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (currentSpeed > maxSpeed) {
            particle.vx = (particle.vx / currentSpeed) * maxSpeed;
            particle.vy = (particle.vy / currentSpeed) * maxSpeed;
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
    // visualizer.setupFileListener();
    // visualizer.setupButtonListeners();
    // The autoPlay function is called inside the constructor after loading the default track
};






function setupButtonListeners() {
    document.getElementById('playButton').addEventListener('click', visualizer.handlePlay);
    document.getElementById('stopButton').addEventListener('click', visualizer.handleStop);
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
