// Particle system configuration
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
            "value": 5,
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

class AudioVisualizer {
    constructor() {
        // Initialize audio context with fallback
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        
        // Initialize state
        this.init();
        
        // Setup UI and events
        this.setupUI();
        this.setupEventListeners();
        
        // Load initial track
        this.loadTrack(this.playlist.currentIndex, false);
    }

    init() {
        // Audio processing setup
        this.audioSource = null;
        this.data = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Playback state
        this.state = {
            isPlaying: false,
            isPaused: false,
            isStopped: true
        };
        
        // Timing information
        this.timing = {
            startTime: 0,
            pausedAt: 0
        };
        
        // Audio buffer
        this.buffer = null;
        
        // Playlist configuration
        this.playlist = {
            tracks: [
                'https://dl.dropboxusercontent.com/scl/fi/8km1bqcn5352t7ep4sapd/01.-STARGAZING.mp3?rlkey=mhdfkxqqm2lypqzq4w2xsnwrw&st=fb8lu7or&dl=0',
                'https://dl.dropboxusercontent.com/scl/fi/eyhxveg8ed9o89l9qvhg2/03.-SICKO-MODE.mp3?rlkey=o42gwx5ndu4tkawnjfku1cn5f&st=q6d6z2yb&dl=0'
            ],
            currentIndex: 0
        };
    }

    setupUI() {
        // Get DOM elements
        this.elements = {
            container: document.getElementById('particles-js'),
            audioPlayer: document.getElementById('audioPlayer'),
            playButton: document.getElementById('playButton'),
            stopButton: document.getElementById('stopButton'),
            fileInput: document.getElementById('audioFile'),
            seekBar: document.getElementById('seekBar'),
            volumeSlider: document.getElementById('volumeSlider')
        };

        // Initialize particles
        particlesJS('particles-js', particlesInitialConfig);
    }

    setupEventListeners() {
        // Bind methods
        this.handlePlay = this.handlePlay.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.handleAudioEnd = this.handleAudioEnd.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.loop = this.loop.bind(this);

        // Add event listeners
        this.elements.playButton.addEventListener('click', this.handlePlay);
        this.elements.stopButton.addEventListener('click', this.handleStop);
        this.elements.fileInput.addEventListener('change', this.handleFileChange);
        
        // Optional volume control
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                if (this.audioSource) {
                    const gainNode = this.audioContext.createGain();
                    gainNode.gain.value = volume;
                    this.audioSource.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                }
            });
        }
    }

    async loadTrack(trackIndex, autoPlay = true) {
        try {
            const response = await fetch(this.playlist.tracks[trackIndex]);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.buffer = audioBuffer;
            if (autoPlay && !this.state.isStopped) {
                await this.handlePlay();
            }
        } catch (error) {
            console.error('Error loading track:', error);
        }
    }

    async handlePlay() {
        // Resume AudioContext if it's suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.state.isStopped = false;

        if (this.audioSource) {
            this.audioSource.disconnect();
        }

        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.buffer;
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        const offset = this.state.isPaused ? 
            this.timing.pausedAt - this.timing.startTime : 0;

        this.audioSource.start(0, offset);
        this.audioSource.onended = this.handleAudioEnd;

        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.timing.startTime = this.audioContext.currentTime - offset;

        // Update UI
        this.elements.playButton.innerHTML = '<i class="fas fa-pause"></i>';
        
        // Start visualization
        this.loop();
    }

    handleStop() {
        if (this.state.isPlaying || this.state.isPaused) {
            if (this.audioSource) {
                this.audioSource.stop();
                this.audioSource = null;
            }

            // Reset state
            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.isStopped = true;
            this.timing.startTime = 0;
            this.timing.pausedAt = 0;

            // Reset UI
            this.elements.playButton.innerHTML = '<i class="fas fa-play"></i>';
            
            // Reset particles
            particlesJS('particles-js', particlesInitialConfig);
        }
    }

    handleAudioEnd() {
        if (!this.state.isStopped) {
            this.playlist.currentIndex = (this.playlist.currentIndex + 1) % this.playlist.tracks.length;
            this.loadTrack(this.playlist.currentIndex, true);
        }
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        
        if (!file.type.startsWith('audio/')) {
            alert('Please select an audio file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const audioBuffer = await this.audioContext.decodeAudioData(e.target.result);
                this.buffer = audioBuffer;
                await this.handlePlay();
            } catch (error) {
                console.error('Error decoding audio data:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    loop() {
        if (!this.state.isStopped && this.state.isPlaying) {
            this.analyser.getByteFrequencyData(this.data);
            this.updateParticles();
            requestAnimationFrame(this.loop);
        }
    }

    updateParticles() {
        const pJS = window.pJSDom[window.pJSDom.length - 1]?.pJS;
        
        if (pJS?.particles?.array) {
            const midPoint = Math.floor(this.data.length / 2);
            const lowerHalfArray = this.data.slice(0, midPoint);
            const upperHalfArray = this.data.slice(midPoint);

            const lowerMax = Math.max(...lowerHalfArray);
            const upperAvg = this.calculateAverage(upperHalfArray);

            const lowerMaxNormalized = lowerMax / 256;
            const speedMultiplier = upperAvg / 256;

            pJS.particles.array.forEach(particle => {
                this.adjustParticle(particle, lowerMaxNormalized, speedMultiplier);
            });
        }
    }

    adjustParticle(particle, lowerMaxNormalized, speedMultiplier) {
        const config = {
            sizeMultiplier: 10,
            baseSpeed: 2,
            maxSize: 20,
            minSize: 1,
            maxSpeed: 1
        };

        particle.vx = config.baseSpeed * speedMultiplier;
        particle.vy = config.baseSpeed * speedMultiplier;

        particle.vm = particle.vm || particle.radius;
        particle.radius = particle.vm * (1 + lowerMaxNormalized * config.sizeMultiplier);
        particle.radius = Math.min(config.maxSize, Math.max(config.minSize, particle.radius));

        const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (currentSpeed > config.maxSpeed) {
            const scale = config.maxSpeed / currentSpeed;
            particle.vx *= scale;
            particle.vy *= scale;
        }
    }

    calculateAverage(array) {
        return array.length ? 
            array.reduce((sum, value) => sum + value, 0) / array.length : 0;
    }
}

// Initialize on window load
window.addEventListener('load', () => {
    const visualizer = new AudioVisualizer();
});