import { shiftHue } from '../utils/colorUtils.js';
import { 
    visualizationModes, 
    defaultVisualizerSettings,
    getModeConfig 
} from '../config/visualModes.js';


const COLOR_PALETTES = {
    neon: {
        name: "Neon Dreams",
        colors: [
            "#FF00FF", // Bright magenta
            "#00FFFF", // Cyan
            "#FF3F8C", // Pink
            "#7A04EB", // Purple
            "#0FF0FC"  // Electric blue
        ]
    },
    sunset: {
        name: "Sunset Vibes",
        colors: [
            "#FF6B6B", // Coral
            "#FFB067", // Light orange
            "#FFE66D", // Yellow
            "#4ECDC4", // Turquoise
            "#45B7D1"  // Sky blue
        ]
    },
    aurora: {
        name: "Aurora Lights",
        colors: [
            "#A8E6CF", // Mint
            "#DCEDC1", // Light green
            "#FFD3B6", // Peach
            "#FFAAA5", // Pink
            "#FF8B94"  // Coral
        ]
    },
    retro: {
        name: "Retro Wave",
        colors: [
            "#FF2A6D", // Hot pink
            "#05D9E8", // Neon blue
            "#005678", // Deep blue
            "#01012B", // Dark blue
            "#D1F7FF"  // Light cyan
        ]
    },
    galaxy: {
        name: "Galaxy",
        colors: [
            "#5D12D2", // Deep purple
            "#B931FC", // Bright purple
            "#FF5EDC", // Pink
            "#FFA9F9", // Light pink
            "#FFE5FF"  // Pale pink
        ]
    }
};

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
            // Split frequency data into four ranges for more detailed analysis
            const subBassRange = audioData.slice(0, Math.floor(audioData.length * 0.05));  // 0-5%
            const bassRange = audioData.slice(Math.floor(audioData.length * 0.05), Math.floor(audioData.length * 0.2));  // 5-20%
            const midRange = audioData.slice(Math.floor(audioData.length * 0.2), Math.floor(audioData.length * 0.6));  // 20-60%
            const highRange = audioData.slice(Math.floor(audioData.length * 0.6));  // 60-100%

            // Calculate energy levels with peak detection
            const subBassEnergy = this.calculatePeakEnergy(subBassRange);
            const bassEnergy = this.calculatePeakEnergy(bassRange);
            const midEnergy = this.calculatePeakEnergy(midRange);
            const highEnergy = this.calculatePeakEnergy(highRange);

            // Calculate dynamic movement parameters
            const overallEnergy = (subBassEnergy + bassEnergy + midEnergy + highEnergy) / 4;
            const beatDetected = subBassEnergy > 0.8 || bassEnergy > 0.8; // Simple beat detection

            // Update each particle based on frequency analysis
            pJS.particles.array.forEach((particle, index) => {
                const particleGroup = index % 4; // Divide particles into 4 groups
                
                switch(particleGroup) {
                    case 0: // Sub-bass particles (deep rumble)
                        this.adjustParticle(particle, {
                            energy: subBassEnergy,
                            speed: overallEnergy,
                            color: '#FF0000',
                            maxSize: 30,
                            minSize: 8,
                            pulseOnBeat: true,
                            beatDetected: beatDetected
                        });
                        break;
                    case 1: // Bass particles
                        this.adjustParticle(particle, {
                            energy: bassEnergy,
                            speed: overallEnergy,
                            color: '#FF7F00',
                            maxSize: 25,
                            minSize: 6,
                            pulseOnBeat: true,
                            beatDetected: beatDetected
                        });
                        break;
                    case 2: // Mid-range particles
                        this.adjustParticle(particle, {
                            energy: midEnergy,
                            speed: overallEnergy,
                            color: '#FFFF00',
                            maxSize: 15,
                            minSize: 4,
                            pulseOnBeat: false
                        });
                        break;
                    case 3: // High-range particles
                        this.adjustParticle(particle, {
                            energy: highEnergy,
                            speed: overallEnergy,
                            color: '#00FFFF',
                            maxSize: 10,
                            minSize: 2,
                            pulseOnBeat: false
                        });
                        break;
                }
            });
        }
    }

    calculatePeakEnergy(range) {
        const average = this.calculateAverage(range);
        const peak = Math.max(...range);
        return (average + peak) / (2 * 256); // Normalized between 0 and 1
    }

    adjustParticle(particle, config) {
        const {
            energy,
            speed,
            color,
            maxSize,
            minSize,
            pulseOnBeat,
            beatDetected
        } = config;

        // Smooth acceleration using exponential moving average
        const acceleration = 0.15 * this.visualizerSettings.sensitivity;
        const targetSpeed = speed * 3 * this.visualizerSettings.sensitivity;
        
        // Update velocity with smooth transition
        particle.vx += (Math.random() * 2 - 1) * (targetSpeed - Math.abs(particle.vx)) * acceleration;
        particle.vy += (Math.random() * 2 - 1) * (targetSpeed - Math.abs(particle.vy)) * acceleration;

        // Apply velocity limits
        const maxVelocity = 5 * this.visualizerSettings.sensitivity;
        particle.vx = Math.max(Math.min(particle.vx, maxVelocity), -maxVelocity);
        particle.vy = Math.max(Math.min(particle.vy, maxVelocity), -maxVelocity);

        // Size pulsing based on energy and beats
        const baseSize = minSize + (maxSize - minSize) * energy;
        let targetSize = baseSize;
        
        if (pulseOnBeat && beatDetected) {
            targetSize *= 1.5; // Pulse effect on beat
        }

        // Smooth size transition
        particle.radius += (targetSize - particle.radius) * 0.1;

        // Don't directly modify particle color, use opacity for energy visualization
        particle.opacity = 0.3 + energy * 0.7; // Dynamic opacity based on energy

        // Add subtle rotation based on energy
        if (!particle.rotation) particle.rotation = 0;
        particle.rotation += energy * 2;
    }

    analyzeFrequencyCharacteristics(audioData) {
        const chunks = 8; // Divide spectrum into 8 parts
        const chunkSize = Math.floor(audioData.length / chunks);
        
        return Array(chunks).fill(0).map((_, i) => {
            const start = i * chunkSize;
            const end = start + chunkSize;
            const chunk = audioData.slice(start, end);
            
            return {
                average: this.calculateAverage(chunk),
                peak: Math.max(...chunk),
                variance: this.calculateVariance(chunk)
            };
        });
    }

    calculateVariance(array) {
        const mean = this.calculateAverage(array);
        return array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
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
                return [
                    "#FF6B6B", // Coral
                    "#FFB067", // Light orange
                    "#FFE66D", // Yellow
                    "#4ECDC4", // Turquoise
                    "#45B7D1"  // Sky blue
                ];
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

    setColorPalette(paletteName) {
        const palette = COLOR_PALETTES[paletteName] || COLOR_PALETTES.neon;
        const pJS = window.pJSDom[window.pJSDom.length - 1]?.pJS;
        
        if (pJS) {
            // Update the particle colors configuration
            pJS.particles.color.value = palette.colors;
            
            // Update existing particles
            pJS.particles.array.forEach((particle, index) => {
                particle.color = palette.colors[index % palette.colors.length];
            });
            
            // Update linked lines color to match theme
            pJS.particles.line_linked.color = palette.colors[0];
            
            // Force a redraw
            pJS.fn.particlesRefresh();
        }
    }
}