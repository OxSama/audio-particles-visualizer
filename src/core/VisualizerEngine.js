import { shiftHue } from '../utils/colorUtils.js';
import { 
    visualizationModes, 
    defaultVisualizerSettings,
    getModeConfig 
} from '../config/visualModes.js';

export default class VisualizerEngine {
    constructor(audioCore) {
        this.audioCore = audioCore;
        
        // Visualization settings
        this.visualizerSettings = { ...defaultVisualizerSettings };

        // Current visualization mode
        this.currentMode = 'particles';
        
        // Animation frame ID for cleanup
        this.animationFrameId = null;
        
        // Performance monitoring
        this._lastFrame = 0;
        
        // Initialize the visualizer
        this.init();
    }

    init() {
        // Initialize particles.js with default config
        particlesJS('particles-js', this.getDefaultConfig());
        this.startVisualization();
    }

    getDefaultConfig() {
        return {
            "particles": {
                "number": {
                    "value": this.visualizerSettings.particleCount,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": this.getParticleColors()
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
            }
        };
    }

    startVisualization() {
        this.loop();
    }

    stopVisualization() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    loop = () => {
        if (this.audioCore.state.isPlaying) {
            const audioData = this.audioCore.getAudioData();
            this.updateParticles(audioData);
            
            if (this.visualizerSettings.showStats) {
                this.updateStats();
            }
        }
        
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    updateParticles(audioData) {
        const pJS = window.pJSDom[window.pJSDom.length - 1]?.pJS;
        
        if (pJS?.particles?.array) {
            const midPoint = Math.floor(audioData.length / 2);
            const lowerHalfArray = audioData.slice(0, midPoint);
            const upperHalfArray = audioData.slice(midPoint);

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

    updateVisualization() {
        const config = getModeConfig(this.currentMode);

        const updatedConfig = this.applyCurrentSettings(config);

        particlesJS('particles-js', updatedConfig);
    }

    applyCurrentSettings(config) {
        return {
            ...config,
            particles: {
                ...config.particles,
                number: {
                    ...config.particles.number,
                    value: this.visualizerSettings.particleCount
                },
                color: {
                    value: this.getParticleColors()
                }
            }
        };
    }

    // Settings updates
    updateSettings(newSettings) {
        this.visualizerSettings = {
            ...this.visualizerSettings,
            ...newSettings
        };
        this.updateVisualization();
    }

    setMode(mode) {
        this.currentMode = mode;
        this.updateVisualization();
    }

    getParticleColors() {
        switch (this.visualizerSettings.colorMode) {
            case 'solid':
                return this.visualizerSettings.baseColor;
            case 'gradient':
                return [
                    this.visualizerSettings.baseColor,
                    shiftHue(this.visualizerSettings.baseColor, 60),
                    shiftHue(this.visualizerSettings.baseColor, 120)
                ];
            default: // spectrum
                return ["#fc0303", "#fcdb03", "#039dfc", "#fc03ca", "#03fc20"];
        }
    }

    calculateAverage(array) {
        return array.length ? 
            array.reduce((sum, value) => sum + value, 0) / array.length : 0;
    }

    // Cleanup
    dispose() {
        this.stopVisualization();
    }
}