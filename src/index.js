import AudioCore from "./core/AudioCore";
import VisualizerEngine from "./core/VisualizerEngine";
import { defaultVisualizerSettings } from "./config/visualModes";

class AudioVisualizer {
  /**
   * Creates an audio visualizer instance
   * @param {Object} options - Configuration options
   * @param {string|Element} options.container - Container element or selector
   * @param {string|Element} options.audio - Audio element or selector
   * @param {Object} [options.settings] - Visualization settings
   */
  constructor(options = {}) {
    if (!options.container) {
      throw new Error("Container element is required");
    }
    if (!options.audio) {
      throw new Error("Audio element is required");
    }

    // Initialize components
    this.audioCore = new AudioCore();
    this.visualizer = new VisualizerEngine(this.audioCore);

    // Apply settings
    if (options.settings) {
      this.visualizer.updateSettings({
        ...defaultVisualizerSettings,
        ...options.settings,
      });
    }
  }

  /**
   * Start audio playback
   * @returns {Promise<void>}
   */
  play() {
    return this.audioCore.handlePlay();
  }

  /**
   * Pause audio playback
   */
  pause() {
    this.audioCore.handlePause();
  }

  /**
   * Stop audio playback
   */
  stop() {
    this.audioCore.handleStop();
  }

  /**
   * Set audio volume
   * @param {number} value - Volume value (0-1)
   */
  setVolume(value) {
    if (value >= 0 && value <= 1) {
      this.audioCore.audioControls.volume = value;
      this.audioCore.updateVolume();
    }
  }

  /**
   * Set visualization mode
   * @param {string} mode - Visualization mode name
   */
  setMode(mode) {
    this.visualizer.setMode(mode);
  }

  /**
   * Set color palette
   * @param {string} palette - Color palette name
   */
  setColorPalette(palette) {
    this.visualizer.setColorPalette(palette);
  }

  /**
   * Update visualization settings
   * @param {Object} settings - New settings
   */
  updateSettings(settings) {
    this.visualizer.updateSettings(settings);
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.audioCore.dispose();
    this.visualizer.dispose();
  }
}

// Export main class
export default AudioVisualizer;

// Export additional utilities for advanced usage
export { AudioCore, VisualizerEngine, defaultVisualizerSettings };
