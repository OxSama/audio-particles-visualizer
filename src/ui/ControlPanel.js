import { controlPanelTemplate, trackInfoTemplate } from './templates.js';
import { formatTime } from '../utils/timeUtils.js';
import { visualizationModes, getAvailableModes } from '../config/visualModes.js';

export default class ControlPanel {
    constructor(audioCore, visualizer) {
        this.audioCore = audioCore;
        this.visualizer = visualizer;
        this.elements = {};
        this.isVisible = true;
        
        this.render();
        this.bindElements();
        this.setupEventListeners();
        this.populateVisualizationModes();
    }

    render() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'controlPanelToggle';
        toggleBtn.className = 'fixed top-4 right-4 bg-black bg-opacity-50 p-2 rounded-lg text-white z-20 hover:bg-opacity-70 transition-all duration-200 backdrop-blur-sm hidden';
        toggleBtn.innerHTML = '<i class="fas fa-cog text-xl"></i>';
        document.body.appendChild(toggleBtn);

        const controlPanel = document.createElement('div');
        controlPanel.id = 'mainControlPanel';


        const modifiedTemplate = controlPanelTemplate.replace(
            '<div class="flex flex-col space-y-4">',
            `<div class="flex flex-col space-y-4">
                <div class="flex justify-end">
                    <button id="closeControlPanel" class="hover:text-blue-400 transition-colors">
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
        this.elements.controlPanel.style.display = 'none';
        this.elements.toggleButton.style.display = 'block';
    }

    showPanel() {
        this.isVisible = true;
        this.elements.controlPanel.style.display = 'block';
        this.elements.toggleButton.style.display = 'none';
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