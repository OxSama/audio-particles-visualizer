import ControlPanel from './ControlPanel.js';
import { loadingTemplate } from './templates.js';

export default class UIController {
    constructor(audioCore, visualizer) {
        this.audioCore = audioCore;
        this.visualizer = visualizer;
        
        // Initialize UI components
        this.controlPanel = new ControlPanel(audioCore, visualizer);
        
        // Setup global event listeners
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    if (this.audioCore.state.isPlaying) {
                        this.audioCore.handlePause();
                    } else {
                        this.audioCore.handlePlay();
                    }
                    break;
                case 'arrowright':
                    e.preventDefault();
                    this.controlPanel.elements.nextTrack.click();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    this.controlPanel.elements.prevTrack.click();
                    break;
                case 'm':
                    e.preventDefault();
                    this.controlPanel.elements.muteBtn.click();
                    break;
            }
        });
    }

    showLoading(show = true) {
        let loader = document.getElementById('audioLoader');
        if (!loader && show) {
            loader = document.createElement('div');
            loader.id = 'audioLoader';
            loader.innerHTML = loadingTemplate;
            document.body.appendChild(loader);
        } else if (loader && !show) {
            loader.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 
            'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    updateTrackInfo(trackName) {
        this.controlPanel.updateTrackInfo(trackName);
    }

    updateTimeDisplay(currentTime, duration) {
        this.controlPanel.updateTimeDisplay(currentTime, duration);
    }
}