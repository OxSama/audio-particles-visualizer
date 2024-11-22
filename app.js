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

const visualizationModes = {
    "particles": {
        name: "Particles Dance",
        config: particlesInitialConfig
    },
    "wave": {
        name: "Wave Form",
        config: {
            ...particlesInitialConfig,
            particles: {
                ...particlesInitialConfig.particles,
                move: {
                    ...particlesInitialConfig.particles.move,
                    direction: "top",
                    straight: true
                }
            }
        }
    },
    "circular": {
        name: "Circular Motion",
        config: {
            ...particlesInitialConfig,
            particles: {
                ...particlesInitialConfig.particles,
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            }
        }
    }
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

        this.currentMode = 'particles';
        this.visualizerSettings = {
            sensitivity: 1.0,
            particleCount: 50,
            colorMode: 'spectrum', // 'spectrum', 'solid', 'gradient'
            baseColor: '#ffffff',
            showStats: false
        };
        
        this.setupControlPanel();

    }


    setupControlPanel() {
        // Create control panel HTML
        const controlPanel = document.createElement('div');
        controlPanel.className = 'fixed top-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg text-white z-20';
        controlPanel.innerHTML = `
            <div class="flex flex-col space-y-4">
                <div>
                    <label class="block text-sm font-medium">Visualization Mode</label>
                    <select id="vizMode" class="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-sm">
                        ${Object.entries(visualizationModes).map(([key, mode]) => 
                            `<option value="${key}">${mode.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium">Sensitivity</label>
                    <input type="range" id="sensitivity" min="0.1" max="2" step="0.1" value="1" 
                           class="mt-1 block w-full">
                </div>
                
                <div>
                    <label class="block text-sm font-medium">Particle Count</label>
                    <input type="range" id="particleCount" min="20" max="200" value="50" 
                           class="mt-1 block w-full">
                </div>
                
                <div>
                    <label class="block text-sm font-medium">Color Mode</label>
                    <select id="colorMode" class="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-sm">
                        <option value="spectrum">Spectrum</option>
                        <option value="solid">Solid</option>
                        <option value="gradient">Gradient</option>
                    </select>
                </div>
                
                <div id="colorPicker" class="hidden">
                    <label class="block text-sm font-medium">Base Color</label>
                    <input type="color" id="baseColor" value="#ffffff" 
                           class="mt-1 block w-full h-8 rounded-md">
                </div>
                
                <div>
                    <label class="flex items-center">
                        <input type="checkbox" id="showStats" class="rounded bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0">
                        <span class="ml-2 text-sm">Show Stats</span>
                    </label>
                </div>
            </div>
        `;
        
        document.body.appendChild(controlPanel);
        
        // Add event listeners for controls
        this.setupControlListeners();
    }

    setupControlListeners() {
        const vizMode = document.getElementById('vizMode');
        const sensitivity = document.getElementById('sensitivity');
        const particleCount = document.getElementById('particleCount');
        const colorMode = document.getElementById('colorMode');
        const baseColor = document.getElementById('baseColor');
        const showStats = document.getElementById('showStats');
        const colorPicker = document.getElementById('colorPicker');

        vizMode.addEventListener('change', (e) => {
            this.currentMode = e.target.value;
            this.updateVisualization();
        });

        sensitivity.addEventListener('input', (e) => {
            this.visualizerSettings.sensitivity = parseFloat(e.target.value);
        });

        particleCount.addEventListener('input', (e) => {
            this.visualizerSettings.particleCount = parseInt(e.target.value);
            this.updateVisualization();
        });

        colorMode.addEventListener('change', (e) => {
            this.visualizerSettings.colorMode = e.target.value;
            colorPicker.style.display = e.target.value === 'solid' ? 'block' : 'none';
            this.updateVisualization();
        });

        baseColor.addEventListener('input', (e) => {
            this.visualizerSettings.baseColor = e.target.value;
            this.updateVisualization();
        });

        showStats.addEventListener('change', (e) => {
            this.visualizerSettings.showStats = e.target.checked;
            this.updateStats();
        });
    }

    updateVisualization() {
        const config = {
            ...visualizationModes[this.currentMode].config,
            particles: {
                ...visualizationModes[this.currentMode].config.particles,
                number: {
                    ...visualizationModes[this.currentMode].config.particles.number,
                    value: this.visualizerSettings.particleCount
                },
                color: {
                    value: this.getParticleColors()
                }
            }
        };

        particlesJS('particles-js', config);
    }

    getParticleColors() {
        switch (this.visualizerSettings.colorMode) {
            case 'solid':
                return this.visualizerSettings.baseColor;
            case 'gradient':
                return [
                    this.visualizerSettings.baseColor,
                    this.shiftHue(this.visualizerSettings.baseColor, 60),
                    this.shiftHue(this.visualizerSettings.baseColor, 120)
                ];
            default: // spectrum
                return ["#fc0303", "#fcdb03", "#039dfc", "#fc03ca", "#03fc20"];
        }
    }

    shiftHue(hex, degree) {
        // Convert hex to HSL and shift hue
        let rgb = hexToRgb(hex);
        let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.h = (hsl.h + degree) % 360;
        rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    updateStats() {
        if (!this.statsElement) {
            this.statsElement = document.createElement('div');
            this.statsElement.className = 'fixed bottom-4 left-4 bg-black bg-opacity-50 p-4 rounded-lg text-white z-20';
            document.body.appendChild(this.statsElement);
        }

        this.statsElement.style.display = this.visualizerSettings.showStats ? 'block' : 'none';

        if (this.visualizerSettings.showStats) {
            requestAnimationFrame(() => {
                const stats = {
                    fps: Math.round(1000 / (performance.now() - this._lastFrame || 0)),
                    particles: window.pJSDom[0]?.pJS.particles.array.length || 0,
                    audioLevel: Math.round(this.getAverageAudioLevel() * 100)
                };
                
                this.statsElement.innerHTML = `
                    <div class="text-sm">
                        <div>FPS: ${stats.fps}</div>
                        <div>Particles: ${stats.particles}</div>
                        <div>Audio Level: ${stats.audioLevel}%</div>
                    </div>
                `;
                
                this._lastFrame = performance.now();
            });
        }
    }

    getAverageAudioLevel() {
        if (!this.data) return 0;
        return Array.from(this.data).reduce((sum, val) => sum + val, 0) / (this.data.length * 256);
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
        // const config = {
        //     sizeMultiplier: 10,
        //     baseSpeed: 2,
        //     maxSize: 20,
        //     minSize: 1,
        //     maxSpeed: 1
        // };

        const config = {
            sizeMultiplier: 10 * this.visualizerSettings.sensitivity,
            baseSpeed: 2 * this.visualizerSettings.sensitivity,
            maxSize: 20,
            minSize: 1,
            maxSpeed: 1 * this.visualizerSettings.sensitivity
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



// Add color utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s, l: l };
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        h /= 360;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}