import AudioCore from "./core/AudioCore.js";
import VisualizerEngine from "./core/VisualizerEngine.js";
import UIController from "./ui/UIController.js";

class AudioVisualizer {
  constructor() {
    // Initialize AudioCore
    this.audioCore = new AudioCore();

    // Initialize VisualizerEngine with AudioCore
    this.visualizer = new VisualizerEngine(this.audioCore);

    this.ui = new UIController(this.audioCore, this.visualizer);

    // Setup cleanup
    this.setupCleanup();
  }

  setupCleanup() {
    window.addEventListener("beforeunload", () => {
      this.dispose();
    });
  }

  dispose() {
    this.audioCore.dispose();
    this.visualizer.dispose();
  }
}

// Initialize on window load
window.addEventListener("load", () => {
  const audioVisualizer = new AudioVisualizer();
});
