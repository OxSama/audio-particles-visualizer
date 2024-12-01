import { controlPanelTemplate, trackInfoTemplate } from './templates.js';
import { formatTime } from '../utils/timeUtils.js';
import { visualizationModes, getAvailableModes } from '../config/visualModes.js';

export default class ControlPanel {
    constructor(audioCore, visualizer) {
        this.audioCore = audioCore;
        this.visualizer = visualizer;
        this.elements = {};
        this.isVisible = false;
        
        this.setupStyles();
        this.render();
        this.bindElements();
        this.setupEventListeners();
        this.populateVisualizationModes();
        this.initializeHiddenState();
    }

    setupStyles() {
        // Create and append styles for animations
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .control-panel-slide {
                transform: translateX(0);
                opacity: 1;
                transition: all 0.3s ease-out;
                position: fixed;  /* Ensure it stays fixed */
                top: 1rem;      /* Match the original positioning */
                right: 1rem;
                /* Remove any default margins that might affect positioning */
                margin: 0;
            }
    
            .control-panel-slide.hidden {
                transform: translateX(20px);  /* Smaller slide distance */
                opacity: 0;
                pointer-events: none;  /* Prevent interaction while hidden */
            }
    
            .toggle-button-slide {
                transform: translateX(0);
                opacity: 1;
                transition: all 0.3s ease-out;
            }
    
            .toggle-button-slide.hidden {
                transform: translateX(20px);  /* Match the panel slide distance */
                opacity: 0;
            }
    
            /* Subtle fade animation instead of bounce */
            @keyframes fadeIn {
                0% { 
                    transform: translateX(20px);
                    opacity: 0;
                }
                100% { 
                    transform: translateX(0);
                    opacity: 1;
                }
            }
    
            .control-panel-fade {
                animation: fadeIn 0.3s ease-out forwards;
            }
    
            /* Hover effect for toggle button */
            .toggle-button-slide:hover {
                transform: scale(1.1);
                transition: transform 0.2s ease-out;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    render() {
        // Create toggle button - now visible by default
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'controlPanelToggle';
        toggleBtn.className = 'fixed top-4 right-4 bg-black bg-opacity-50 p-2 rounded-lg text-white z-20 hover:bg-opacity-70 backdrop-blur-sm toggle-button-slide';
        toggleBtn.innerHTML = '<i class="fas fa-cog text-xl"></i>';
        document.body.appendChild(toggleBtn);
    
        // Create control panel - now hidden by default
        const controlPanel = document.createElement('div');
        controlPanel.id = 'mainControlPanel';
        controlPanel.className = 'control-panel-slide fixed top-4 right-4 hidden';
        controlPanel.style.display = 'none'; // Initially hidden
        
        const modifiedTemplate = controlPanelTemplate.replace(
            '<div class="flex flex-col space-y-4">',
            `<div class="flex flex-col space-y-4">
                <div class="flex justify-end">
                    <button id="closeControlPanel" class="hover:text-blue-400 transition-colors transform hover:scale-110 duration-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`
        );
        
        controlPanel.innerHTML = modifiedTemplate;
        document.body.appendChild(controlPanel);
    }

    bindElements() {
        this.elements = {

            controlPanel: document.getElementById('mainControlPanel'),
            toggleButton: document.getElementById('controlPanelToggle'),
            closeButton: document.getElementById('closeControlPanel'),

            playPauseBtn: document.getElementById('playPauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            prevTrack: document.getElementById('prevTrack'),
            nextTrack: document.getElementById('nextTrack'),
            loopBtn: document.getElementById('loopBtn'),
            muteBtn: document.getElementById('muteBtn'),
            volumeControl: document.getElementById('volumeControl'),
            seekBar: document.getElementById('seekBar'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            vizMode: document.getElementById('vizMode'),
            sensitivity: document.getElementById('sensitivity'),
            particleCount: document.getElementById('particleCount'),
            colorMode: document.getElementById('colorMode'),
            baseColor: document.getElementById('baseColor'),
            showStats: document.getElementById('showStats'),
            colorPicker: document.getElementById('colorPicker'),
            trackInfo: document.querySelector('.track-info-container')
        };
    }

    populateVisualizationModes() {
        const vizModeSelect = document.getElementById('vizMode');
        if (vizModeSelect) {
            Object.entries(visualizationModes).forEach(([key, mode]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = mode.name;
                vizModeSelect.appendChild(option);
            });
        }
    }

    setupEventListeners() {

        this.elements.controlPanel.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform' && !this.isVisible) {
                this.elements.controlPanel.style.display = 'none';
            }
        });

        this.elements.closeButton.addEventListener('click', () => this.hidePanel());
        this.elements.toggleButton.addEventListener('click', () => this.showPanel());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hidePanel();
            }
        });

        this.elements.stopBtn.addEventListener('click', () => {
            this.audioCore.handleStop();
            this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        this.elements.prevTrack.addEventListener('click', () => {
            this.audioCore.playlist.currentIndex = 
                (this.audioCore.playlist.currentIndex - 1 + this.audioCore.playlist.tracks.length) 
                % this.audioCore.playlist.tracks.length;
            this.audioCore.loadTrack(this.audioCore.playlist.currentIndex, true);
        });

        this.elements.nextTrack.addEventListener('click', () => {
            this.audioCore.playlist.currentIndex = 
                (this.audioCore.playlist.currentIndex + 1) 
                % this.audioCore.playlist.tracks.length;
            this.audioCore.loadTrack(this.audioCore.playlist.currentIndex, true);
        });

        this.elements.volumeControl.addEventListener('input', (e) => {
            this.audioCore.audioControls.volume = e.target.value / 100;
            this.audioCore.updateVolume();
        });

        this.elements.vizMode.addEventListener('change', (e) => {
            this.visualizer.setMode(e.target.value);
        });

        this.elements.sensitivity.addEventListener('input', (e) => {
            this.visualizer.updateSettings({ sensitivity: parseFloat(e.target.value) });
        });

        this.elements.particleCount.addEventListener('input', (e) => {
            this.visualizer.updateSettings({ particleCount: parseInt(e.target.value) });
        });

        this.elements.colorMode.addEventListener('change', (e) => {
            this.visualizer.updateSettings({ colorMode: e.target.value });
            this.elements.colorPicker.style.display = 
                e.target.value === 'solid' ? 'block' : 'none';
        });

        this.elements.colorPalette = document.getElementById('colorPalette');
        this.elements.colorPalette.addEventListener('change', (e) => {
            this.visualizer.setColorPalette(e.target.value);
        });
    }


    hidePanel() {
        this.isVisible = false;
        const panel = this.elements.controlPanel;
        const toggleBtn = this.elements.toggleButton;

        // Add hidden class to panel
        panel.classList.add('hidden');
        
        // Show toggle button after panel slides out
        setTimeout(() => {
            toggleBtn.style.display = 'block';
            toggleBtn.classList.remove('hidden');
        }, 300); // Match the transition duration

        // Actually hide the panel after animation completes
        setTimeout(() => {
            panel.style.display = 'none';
        }, 300);
    }

    showPanel() {
        this.isVisible = true;
        const panel = this.elements.controlPanel;
        const toggleBtn = this.elements.toggleButton;
    
        // Hide toggle button
        toggleBtn.classList.add('hidden');
        
        // Prepare panel for animation
        panel.style = "min-width:200px"
        panel.style.display = 'block';
        
        // Trigger reflow
        panel.offsetHeight;
        
        // Remove hidden class to trigger animation
        panel.classList.remove('hidden');
        
        // Hide toggle button after animation
        setTimeout(() => {
            toggleBtn.style.display = 'none';
        }, 300);
    
        // Use fade animation instead of bounce
        panel.classList.add('control-panel-fade');
        setTimeout(() => {
            panel.classList.remove('control-panel-fade');
        }, 300);
    }

    initializeHiddenState() {
        const panel = document.getElementById('mainControlPanel');
        const toggleBtn = document.getElementById('controlPanelToggle');
        
        if (panel && toggleBtn) {
            // Hide panel initially
            panel.classList.add('hidden');
            panel.style.display = 'none';
            
            // Show toggle button initially
            toggleBtn.classList.remove('hidden');
            toggleBtn.style.display = 'block';
        }
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    updateTrackInfo(trackName) {
        if (this.elements.trackInfo) {
            this.elements.trackInfo.innerHTML = trackInfoTemplate(trackName);
        }
    }

    updateTimeDisplay(currentTime, duration) {
        this.elements.currentTime.textContent = formatTime(currentTime);
        this.elements.duration.textContent = formatTime(duration);
        const progress = calculateProgress(currentTime, duration);
        this.elements.seekBar.value = progress;
    }
    
}