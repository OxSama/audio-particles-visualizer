import { controlPanelTemplate, trackInfoTemplate } from './templates.js';
import { formatTime } from '../utils/timeUtils.js';
import { visualizationModes, getAvailableModes } from '../config/visualModes.js';

export default class ControlPanel {
    constructor(audioCore, visualizer) {
        this.audioCore = audioCore;
        this.visualizer = visualizer;
        this.elements = {};
        
        this.render();
        this.bindElements();
        this.setupEventListeners();
        this.populateVisualizationModes();
    }

    render() {
        const controlPanel = document.createElement('div');
        controlPanel.innerHTML = controlPanelTemplate;
        document.body.appendChild(controlPanel);
    }

    bindElements() {
        this.elements = {
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
        // Playback Controls
        this.elements.playPauseBtn.addEventListener('click', () => {
            if (this.audioCore.state.isPlaying) {
                this.audioCore.handlePause();
                this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                this.audioCore.handlePlay();
                this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        });

        this.elements.stopBtn.addEventListener('click', () => {
            this.audioCore.handleStop();
            this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        // Track Navigation
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

        // Volume Controls
        this.elements.volumeControl.addEventListener('input', (e) => {
            this.audioCore.audioControls.volume = e.target.value / 100;
            this.audioCore.updateVolume();
        });

        // Visualization Controls
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