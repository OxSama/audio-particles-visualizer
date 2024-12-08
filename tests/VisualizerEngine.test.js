import VisualizerEngine from "../src/core/VisualizerEngine";
import AudioCore from "../src/core/AudioCore";

describe("VisualizerEngine", () => {
  let visualizer;
  let audioCore;

  beforeEach(() => {
    // Create container element
    document.body.innerHTML = '<div id="particles-js"></div>';

    // Clear mocks
    jest.clearAllMocks();
    global.particlesJS.mockClear();

    audioCore = new AudioCore();
    visualizer = new VisualizerEngine(audioCore);
  });

  afterEach(() => {
    if (visualizer) {
      visualizer.dispose();
    }
    if (audioCore) {
      audioCore.dispose();
    }
    document.body.innerHTML = "";
  });

  test("should initialize with default settings", () => {
    expect(visualizer.currentMode).toBe("particles");
    expect(visualizer.visualizerSettings.sensitivity).toBe(1);
    expect(visualizer.visualizerSettings.particleCount).toBe(50);
    expect(global.particlesJS).toHaveBeenCalled();
  });

  test("should update settings correctly", () => {
    visualizer.updateSettings({
      sensitivity: 1.5,
      particleCount: 100,
    });
    expect(visualizer.visualizerSettings.sensitivity).toBe(1.5);
    expect(visualizer.visualizerSettings.particleCount).toBe(100);
    expect(global.particlesJS).toHaveBeenCalled();
  });

  test("should change visualization mode", () => {
    visualizer.setMode("wave");
    expect(visualizer.currentMode).toBe("wave");
    expect(global.particlesJS).toHaveBeenCalled();
  });

  test("should calculate peak energy correctly", () => {
    const testData = new Uint8Array([128, 255, 64, 192]);
    const energy = visualizer.calculatePeakEnergy(testData);
    expect(energy).toBeGreaterThan(0);
    expect(energy).toBeLessThanOrEqual(1);
  });

  test("should update particles based on audio data", () => {
    const mockData = new Uint8Array(1024);
    for (let i = 0; i < mockData.length; i++) {
      mockData[i] = Math.floor(Math.random() * 256);
    }

    visualizer.updateParticles(mockData);
    // Verify that particle properties were updated
    const particles = global.pJSDom[0].pJS.particles;
    expect(particles).toBeDefined();
  });

  test("should dispose properly", () => {
    visualizer.dispose();
    expect(visualizer.animationFrameId).toBeNull();
  });

  test("should handle color palette changes", () => {
    visualizer.setColorPalette("neon");
    expect(global.pJSDom[0].pJS.fn.particlesRefresh).toHaveBeenCalled();
  });
});
