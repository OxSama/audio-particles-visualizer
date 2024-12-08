import { controlPanelTemplate, trackInfoTemplate } from "./templates.js";
import { formatTime } from "../utils/timeUtils.js";
import {
  visualizationModes,
  getAvailableModes,
} from "../config/visualModes.js";

const ANIMATION = {
  DURATION: 300,
  CLASSES: {
    SLIDE: "control-panel-slide",
    HIDDEN: "hidden",
    FADE: "control-panel-fade",
  },
};

export default class ControlPanel {
  constructor(audioCore, visualizer) {
    this.audioCore = audioCore;
    this.visualizer = visualizer;
    this.elements = {};
    this.isVisible = false;

    this.boundEventHandlers = new Map();

    // this.setupStyles();
    // this.render();
    // this.bindElements();
    // this.setupEventListeners();
    // this.populateVisualizationModes();
    // this.initializeHiddenState();

    this.init();
  }

  init() {
    this.setupStyles();
    this.render();
    this.bindElements();
    this.setupEventListeners();
    this.populateVisualizationModes();
    this.initializeHiddenState();
  }

  setupStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
            .control-panel-slide {
                transform: translateX(0);
                opacity: 1;
                transition: all ${ANIMATION.DURATION}ms ease-out;
                position: fixed;
                top: 1rem;
                right: 1rem;
                margin: 0;
            }
            
            .control-panel-slide.hidden {
                transform: translateX(20px);
                opacity: 0;
                pointer-events: none;
            }
            
            .toggle-button-slide {
                transform: translateX(0);
                opacity: 1;
                transition: all ${ANIMATION.DURATION}ms ease-out;
            }
            
            .toggle-button-slide.hidden {
                transform: translateX(20px);
                opacity: 0;
            }
            
            @keyframes fadeIn {
                from { 
                    transform: translateX(20px);
                    opacity: 0;
                }
                to { 
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .control-panel-fade {
                animation: fadeIn ${ANIMATION.DURATION}ms ease-out forwards;
            }
            
            .toggle-button-slide:hover {
                transform: scale(1.1);
                transition: transform 0.2s ease-out;
            }
        `;
    document.head.appendChild(styleSheet);
  }

  render() {
    this.renderToggleButton();
    this.renderControlPanel();
  }

  renderToggleButton() {
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "controlPanelToggle";
    toggleBtn.className =
      "fixed top-4 right-4 bg-black bg-opacity-50 p-2 rounded-lg text-white z-20 hover:bg-opacity-70 backdrop-blur-sm toggle-button-slide";
    toggleBtn.innerHTML = '<i class="fas fa-cog text-xl"></i>';
    document.body.appendChild(toggleBtn);
  }

  renderControlPanel() {
    const controlPanel = document.createElement("div");
    controlPanel.id = "mainControlPanel";
    controlPanel.className = "control-panel-slide fixed top-4 right-4 hidden";
    controlPanel.style.display = "none";

    const modifiedTemplate = this.getModifiedTemplate();
    controlPanel.innerHTML = modifiedTemplate;
    document.body.appendChild(controlPanel);
  }

  getModifiedTemplate() {
    return controlPanelTemplate.replace(
      '<div class="flex flex-col space-y-4">',
      `<div class="flex flex-col space-y-4">
                <div class="flex justify-end">
                    <button id="closeControlPanel" class="hover:text-blue-400 transition-colors transform hover:scale-110 duration-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`,
    );
  }

  bindElements() {
    this.elements = {
      controlPanel: document.getElementById("mainControlPanel"),
      toggleButton: document.getElementById("controlPanelToggle"),
      closeButton: document.getElementById("closeControlPanel"),

      playPauseBtn: document.getElementById("playPauseBtn"),
      stopBtn: document.getElementById("stopBtn"),
      prevTrack: document.getElementById("prevTrack"),
      nextTrack: document.getElementById("nextTrack"),
      loopBtn: document.getElementById("loopBtn"),
      muteBtn: document.getElementById("muteBtn"),
      volumeControl: document.getElementById("volumeControl"),
      seekBar: document.getElementById("seekBar"),
      currentTime: document.getElementById("currentTime"),
      duration: document.getElementById("duration"),
      vizMode: document.getElementById("vizMode"),
      sensitivity: document.getElementById("sensitivity"),
      particleCount: document.getElementById("particleCount"),
      colorMode: document.getElementById("colorMode"),
      baseColor: document.getElementById("baseColor"),
      showStats: document.getElementById("showStats"),
      colorPicker: document.getElementById("colorPicker"),
      trackInfo: document.querySelector(".track-info-container"),
    };
  }

  populateVisualizationModes() {
    const vizModeSelect = document.getElementById("vizMode");
    if (vizModeSelect) {
      Object.entries(visualizationModes).forEach(([key, mode]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = mode.name;
        vizModeSelect.appendChild(option);
      });
    }
  }

  // setupEventListeners() {

  //     this.boundEventHandlers.set('transitionend', this.handleTransitionEnd.bind(this));
  //     this.boundEventHandlers.set('keydown', this.handleKeyPress.bind(this));

  //     // Add listeners with error handling
  //     this.safeAddEventListener(
  //         this.elements.controlPanel,
  //         'transitionend',
  //         this.boundEventHandlers.get('transitionend')
  //     );

  //     this.safeAddEventListener(
  //         document,
  //         'keydown',
  //         this.boundEventHandlers.get('keydown')
  //     );

  //     this.elements.controlPanel.addEventListener('transitionend', (e) => {
  //         if (e.propertyName === 'transform' && !this.isVisible) {
  //             this.elements.controlPanel.style.display = 'none';
  //         }
  //     });

  //     this.elements.closeButton.addEventListener('click', () => this.hidePanel());
  //     this.elements.toggleButton.addEventListener('click', () => this.showPanel());

  //     document.addEventListener('keydown', (e) => {
  //         if (e.key === 'Escape' && this.isVisible) {
  //             this.hidePanel();
  //         }
  //     });

  //     this.elements.playPauseBtn.addEventListener('click', async () => {
  //         if (this.audioCore.state.isPlaying) {
  //             this.audioCore.handlePause();
  //             this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  //         } else {
  //             await this.audioCore.handlePlay();
  //             this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  //         }
  //     });

  //     this.elements.loopBtn.addEventListener('click', () => {
  //         this.audioCore.audioControls.isLooping = !this.audioCore.audioControls.isLooping;
  //         this.elements.loopBtn.style.opacity = this.audioCore.audioControls.isLooping ? '1' : '0.5';
  //     });

  //     this.elements.muteBtn.addEventListener('click', () => {
  //         if (this.audioCore.audioControls.isMuted) {
  //             this.audioCore.audioControls.volume = this.audioCore.audioControls.previousVolume;
  //             this.elements.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
  //         } else {
  //             this.audioCore.audioControls.previousVolume = this.audioCore.audioControls.volume;
  //             this.audioCore.audioControls.volume = 0;
  //             this.elements.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  //         }
  //         this.audioCore.audioControls.isMuted = !this.audioCore.audioControls.isMuted;
  //         this.elements.volumeControl.value = this.audioCore.audioControls.volume * 100;
  //         this.audioCore.updateVolume();
  //     });

  //     this.elements.prevTrack.addEventListener('click', async () => {
  //         const newIndex = (this.audioCore.playlist.currentIndex - 1 + this.audioCore.playlist.tracks.length)
  //             % this.audioCore.playlist.tracks.length;
  //         await this.audioCore.loadTrack(newIndex, true);
  //         this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  //     });

  //     this.elements.nextTrack.addEventListener('click', async () => {
  //         const newIndex = (this.audioCore.playlist.currentIndex + 1) % this.audioCore.playlist.tracks.length;
  //         await this.audioCore.loadTrack(newIndex, true);
  //         this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  //     });

  //     this.elements.stopBtn.addEventListener('click', () => {
  //         this.audioCore.handleStop();
  //         this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  //     });

  //     this.elements.prevTrack.addEventListener('click', () => {
  //         this.audioCore.playlist.currentIndex =
  //             (this.audioCore.playlist.currentIndex - 1 + this.audioCore.playlist.tracks.length)
  //             % this.audioCore.playlist.tracks.length;
  //         this.audioCore.loadTrack(this.audioCore.playlist.currentIndex, true);
  //     });

  //     this.elements.nextTrack.addEventListener('click', () => {
  //         this.audioCore.playlist.currentIndex =
  //             (this.audioCore.playlist.currentIndex + 1)
  //             % this.audioCore.playlist.tracks.length;
  //         this.audioCore.loadTrack(this.audioCore.playlist.currentIndex, true);
  //     });

  //     this.elements.volumeControl.addEventListener('input', (e) => {
  //         this.audioCore.audioControls.volume = e.target.value / 100;
  //         this.audioCore.updateVolume();
  //     });

  //     this.elements.vizMode.addEventListener('change', (e) => {
  //         this.visualizer.setMode(e.target.value);
  //     });

  //     this.elements.sensitivity.addEventListener('input', (e) => {
  //         this.visualizer.updateSettings({ sensitivity: parseFloat(e.target.value) });
  //     });

  //     this.elements.particleCount.addEventListener('input', (e) => {
  //         this.visualizer.updateSettings({ particleCount: parseInt(e.target.value) });
  //     });

  //     this.elements.colorMode.addEventListener('change', (e) => {
  //         this.visualizer.updateSettings({ colorMode: e.target.value });
  //         this.elements.colorPicker.style.display =
  //             e.target.value === 'solid' ? 'block' : 'none';
  //     });

  //     this.elements.colorPalette = document.getElementById('colorPalette');
  //     this.elements.colorPalette.addEventListener('change', (e) => {
  //         this.visualizer.setColorPalette(e.target.value);
  //     });
  // }

  setupEventListeners() {
    // Panel transition and keyboard handlers
    this.boundEventHandlers.set(
      "transitionend",
      this.handleTransitionEnd.bind(this),
    );
    this.boundEventHandlers.set("keydown", this.handleKeyPress.bind(this));

    this.safeAddEventListener(
      this.elements.controlPanel,
      "transitionend",
      this.boundEventHandlers.get("transitionend"),
    );

    this.safeAddEventListener(
      document,
      "keydown",
      this.boundEventHandlers.get("keydown"),
    );

    // Panel control handlers
    this.elements.controlPanel.addEventListener("transitionend", (e) => {
      if (e.propertyName === "transform" && !this.isVisible) {
        this.elements.controlPanel.style.display = "none";
      }
    });

    this.elements.closeButton.addEventListener("click", () => this.hidePanel());
    this.elements.toggleButton.addEventListener("click", () =>
      this.showPanel(),
    );

    // Audio playback control handlers
    this.setupPlaybackControls();

    // Audio track navigation handlers
    this.setupTrackNavigation();

    // Volume control handlers
    this.setupVolumeControls();

    // Visualization control handlers
    this.setupVisualizationControls();
  }

  setupPlaybackControls() {
    // Play/Pause button
    this.elements.playPauseBtn.addEventListener("click", async () => {
      try {
        if (this.audioCore.state.isPlaying) {
          this.audioCore.handlePause();
          this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
          await this.audioCore.handlePlay();
          this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
      } catch (error) {
        console.error("Error handling play/pause:", error);
      }
    });

    // Stop button
    this.elements.stopBtn.addEventListener("click", () => {
      this.audioCore.handleStop();
      this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    // Loop button
    this.elements.loopBtn.addEventListener("click", () => {
      this.audioCore.audioControls.isLooping =
        !this.audioCore.audioControls.isLooping;
      this.elements.loopBtn.style.opacity = this.audioCore.audioControls
        .isLooping
        ? "1"
        : "0.5";
    });
  }

  setupTrackNavigation() {
    // Previous track
    this.elements.prevTrack.addEventListener("click", async () => {
      try {
        const newIndex =
          (this.audioCore.playlist.currentIndex -
            1 +
            this.audioCore.playlist.tracks.length) %
          this.audioCore.playlist.tracks.length;
        const success = await this.audioCore.loadTrack(newIndex, true);
        if (success) {
          this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
      } catch (error) {
        console.error("Error loading previous track:", error);
      }
    });

    // Next track
    this.elements.nextTrack.addEventListener("click", async () => {
      try {
        const newIndex =
          (this.audioCore.playlist.currentIndex + 1) %
          this.audioCore.playlist.tracks.length;
        const success = await this.audioCore.loadTrack(newIndex, true);
        if (success) {
          this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
      } catch (error) {
        console.error("Error loading next track:", error);
      }
    });
  }

  setupVolumeControls() {
    // Mute button
    this.elements.muteBtn.addEventListener("click", () => {
      if (this.audioCore.audioControls.isMuted) {
        this.audioCore.audioControls.volume =
          this.audioCore.audioControls.previousVolume;
        this.elements.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      } else {
        this.audioCore.audioControls.previousVolume =
          this.audioCore.audioControls.volume;
        this.audioCore.audioControls.volume = 0;
        this.elements.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
      }
      this.audioCore.audioControls.isMuted =
        !this.audioCore.audioControls.isMuted;
      this.elements.volumeControl.value =
        this.audioCore.audioControls.volume * 100;
      this.audioCore.updateVolume();
    });

    // Volume slider
    this.elements.volumeControl.addEventListener("input", (e) => {
      this.audioCore.audioControls.volume = e.target.value / 100;
      this.audioCore.updateVolume();
    });
  }

  setupVisualizationControls() {
    // Visualization mode
    this.elements.vizMode.addEventListener("change", (e) => {
      this.visualizer.setMode(e.target.value);
    });

    // Sensitivity control
    this.elements.sensitivity.addEventListener("input", (e) => {
      this.visualizer.updateSettings({
        sensitivity: parseFloat(e.target.value),
      });
    });

    // Particle count control
    this.elements.particleCount.addEventListener("input", (e) => {
      this.visualizer.updateSettings({
        particleCount: parseInt(e.target.value),
      });
    });

    // Color mode control
    this.elements.colorMode.addEventListener("change", (e) => {
      this.visualizer.updateSettings({ colorMode: e.target.value });
      this.elements.colorPicker.style.display =
        e.target.value === "solid" ? "block" : "none";
    });

    // Color palette control
    if (this.elements.colorPalette) {
      this.elements.colorPalette.addEventListener("change", (e) => {
        this.visualizer.setColorPalette(e.target.value);
      });
    }
  }

  safeAddEventListener(element, event, handler) {
    try {
      if (element) {
        element.addEventListener(event, handler);
      }
    } catch (error) {
      console.error(`Error adding ${event} listener:`, error);
    }
  }

  handleTransitionEnd(e) {
    if (e.propertyName === "transform" && !this.isVisible) {
      this.elements.controlPanel.style.display = "none";
    }
  }

  handleKeyPress(e) {
    if (e.key === "Escape" && this.isVisible) {
      this.hidePanel();
    }
  }

  async hidePanel() {
    this.isVisible = false;
    const { controlPanel, toggleButton } = this.elements;

    controlPanel.classList.add(ANIMATION.CLASSES.HIDDEN);

    await this.wait(ANIMATION.DURATION);

    toggleButton.style.display = "block";
    toggleButton.classList.remove(ANIMATION.CLASSES.HIDDEN);

    await this.wait(ANIMATION.DURATION);

    controlPanel.style.display = "none";
  }

  showPanel() {
    this.isVisible = true;
    const { controlPanel, toggleButton } = this.elements;

    toggleButton.classList.add(ANIMATION.CLASSES.HIDDEN);

    controlPanel.style.minWidth = "300px";
    controlPanel.style.display = "block";

    // Force reflow
    controlPanel.offsetHeight;

    controlPanel.classList.remove(ANIMATION.CLASSES.HIDDEN);

    this.wait(ANIMATION.DURATION);

    toggleButton.style.display = "none";

    controlPanel.classList.add(ANIMATION.CLASSES.FADE);

    this.wait(ANIMATION.DURATION);

    controlPanel.classList.remove(ANIMATION.CLASSES.FADE);
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  initializeHiddenState() {
    const panel = document.getElementById("mainControlPanel");
    const toggleBtn = document.getElementById("controlPanelToggle");

    if (panel && toggleBtn) {
      // Hide panel initially
      panel.classList.add("hidden");
      panel.style.display = "none";

      // Show toggle button initially
      toggleBtn.classList.remove("hidden");
      toggleBtn.style.display = "block";
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
