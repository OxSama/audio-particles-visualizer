import { shiftHue } from '../utils/colorUtils.js';
import { 
    visualizationModes, 
    defaultVisualizerSettings,
    getModeConfig 
} from '../config/visualModes.js';
import { defaultParticleConfig } from '../config/defaultConfig.js'


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

        // Track initialization state
        this.isInitialized = false;  
        
        // Reference to particlesJS instance
        this.pJSInstance = null;

        // Store mode-specific configurations
        this.modeDefaults = visualizationModes;

        // Current mode configuration
        this.currentModeConfig = this.modeDefaults[this.currentMode].config;
        
        // Initialize the visualizer
        this.init();
    }

    init() {
        try {
            // Initialize particles.js with default config
            particlesJS('particles-js', defaultParticleConfig);

            this.pJSInstance = window.pJSDom[window.pJSDom.length - 1]?.pJS;

            if (!this.pJSInstance) {
                throw new Error('Failed to initialize particles.js');
            }

            this.isInitialized = true;
            this.startVisualization();

        } catch (error) {
            console.error('Visualization initialization failed:', error);
        }
    }

    startVisualization() {
        if (!this.isInitialized) {
            console.warn('Attempting to start visualization before initialization');
            return;
        }
        this.stopVisualization();
        this.loop();
    }

    stopVisualization() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    loop = () => {
        try {
            if (this.audioCore?.state?.isPlaying) {
                const audioData = this.audioCore.getAudioData();
                if (audioData && audioData.length > 0) {
                    this.updateParticles(audioData);
                }
            }
            
            if (this.visualizerSettings.showStats) {
                this.updateStats();
            }
            
            this.animationFrameId = requestAnimationFrame(this.loop);
        } catch (error) {
            console.error('Visualization loop error:', error);
            this.stopVisualization();
        }
    }

    updateParticles(audioData) {
        // Early validation of audioData
        if (!(audioData instanceof Uint8Array) || audioData.length === 0) {
            console.warn('Invalid audio data received');
            return;
        }
        
        // Get particle instance
        if (!this.pJSInstance?.particles?.array) {
            this.pJSInstance = window.pJSDom[window.pJSDom.length - 1]?.pJS;
            if (!this.pJSInstance?.particles?.array) {
                console.warn('Particles instance not available');
                return;
            }
        }
    
        try {
            // Convert Uint8Array to regular array for easier manipulation
            const audioArray = Array.from(audioData);
            
            // Split frequency data into ranges
            const totalLength = audioArray.length;
            const subBassRange = audioArray.slice(0, Math.floor(totalLength * 0.05));
            const bassRange = audioArray.slice(
                Math.floor(totalLength * 0.05),
                Math.floor(totalLength * 0.2)
            );
            const midRange = audioArray.slice(
                Math.floor(totalLength * 0.2),
                Math.floor(totalLength * 0.6)
            );
            const highRange = audioArray.slice(Math.floor(totalLength * 0.6));
    
            // Calculate energies
            const subBassEnergy = this.calculatePeakEnergy(subBassRange);
            const bassEnergy = this.calculatePeakEnergy(bassRange);
            const midEnergy = this.calculatePeakEnergy(midRange);
            const highEnergy = this.calculatePeakEnergy(highRange);
            
            const overallEnergy = (subBassEnergy + bassEnergy + midEnergy + highEnergy) / 4;
            const beatDetected = subBassEnergy > 0.8 || bassEnergy > 0.8;
    
            // Update particles based on energy levels
            this.pJSInstance.particles.array.forEach((particle, index) => {
                if (!particle) return;
                
                const particleGroup = index % 4;
                this.updateParticleByGroup(particle, particleGroup, {
                    overallEnergy,
                    beatDetected,
                    subBassEnergy,
                    bassEnergy,
                    midEnergy,
                    highEnergy
                });
            });
        } catch (error) {
            console.error('Error updating particles:', error);
        }
    }

    updateParticleByGroup(particle, group, energyData) {
        const {
            overallEnergy,
            beatDetected,
            subBassEnergy,
            bassEnergy,
            midEnergy,
            highEnergy
        } = energyData;

        try {
            switch(group) {
                case 0:
                    this.adjustParticle(particle, {
                        energy: subBassEnergy,
                        speed: overallEnergy,
                        color: '#FF0000',
                        maxSize: 30,
                        minSize: 8,
                        pulseOnBeat: true,
                        beatDetected
                    });
                    break;
                // ... other cases
            }
        } catch (error) {
            console.error('Error updating particle:', error);
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
    
        try {
            // More aggressive acceleration
            const acceleration = 0.25 * this.visualizerSettings.sensitivity;
            const targetSpeed = speed * 5 * this.visualizerSettings.sensitivity;
            
            // Update velocity with more impact
            particle.vx += (Math.random() * 2 - 1) * (targetSpeed - Math.abs(particle.vx)) * acceleration;
            particle.vy += (Math.random() * 2 - 1) * (targetSpeed - Math.abs(particle.vy)) * acceleration;
    
            // Higher velocity limits
            const maxVelocity = 8 * this.visualizerSettings.sensitivity;
            particle.vx = Math.max(Math.min(particle.vx, maxVelocity), -maxVelocity);
            particle.vy = Math.max(Math.min(particle.vy, maxVelocity), -maxVelocity);
    
            // More dramatic size pulsing
            const baseSize = minSize + (maxSize - minSize) * energy;
            let targetSize = baseSize;
            
            if (pulseOnBeat && beatDetected) {
                targetSize *= 2; // More dramatic pulse effect
            }
    
            // Faster size transition
            particle.radius += (targetSize - particle.radius) * 0.2;
    
            // More dramatic opacity changes
            particle.opacity = 0.2 + energy * 0.8;
    
            // Faster rotation
            if (!particle.rotation) particle.rotation = 0;
            particle.rotation += energy * 4;
    
            // Debug log for a sample particle
            if (Math.random() < 0.01) { // Log only 1% of updates to avoid console spam
                console.log('Particle Update:', {
                    velocity: { x: particle.vx, y: particle.vy },
                    size: particle.radius,
                    opacity: particle.opacity,
                    energy
                });
            }
        } catch (error) {
            console.error('Error adjusting particle:', error);
        }
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
        if (!visualizationModes[mode]) {
            console.error(`Invalid visualization mode: ${mode}`);
            return;
        }

        // Clean up current mode
        this.stopVisualization();

        // Update mode
        this.currentMode = mode;
        
        // Reinitialize with new mode
        this.updateVisualization();
        
        // Restart visualization
        this.startVisualization();
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
            default: 
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
        
        // Clean up particles
        if (this.pJSInstance) {
            this.pJSInstance.particles.array = [];
            this.pJSInstance = null;
        }
        
        // Reset state
        this.isInitialized = false;
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