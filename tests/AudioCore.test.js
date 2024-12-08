import AudioCore from "../src/core/AudioCore";

describe("AudioCore", () => {
  let audioCore;

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };

    audioCore = new AudioCore();
  });

  afterEach(() => {
    if (audioCore) {
      audioCore.dispose();
    }
  });

  test("should initialize with default state", () => {
    expect(audioCore.state.isPlaying).toBeFalsy();
    expect(audioCore.state.isPaused).toBeFalsy();
    expect(audioCore.state.isStopped).toBeTruthy();
  });

  test("should initialize with default audio controls", () => {
    expect(audioCore.audioControls.volume).toBe(1);
    expect(audioCore.audioControls.isMuted).toBeFalsy();
    expect(audioCore.audioControls.isLooping).toBeFalsy();
  });

  test("should load track successfully", async () => {
    const result = await audioCore.loadTrack(0);
    expect(result).toBeTruthy();
    expect(fetch).toHaveBeenCalled();
  });

  test("should handle play state correctly", async () => {
    await audioCore.handlePlay();
    expect(audioCore.state.isPlaying).toBeTruthy();
    expect(audioCore.state.isPaused).toBeFalsy();
    expect(audioCore.state.isStopped).toBeFalsy();
  });

  test("should handle pause state correctly", async () => {
    await audioCore.handlePlay();
    audioCore.handlePause();
    expect(audioCore.state.isPlaying).toBeFalsy();
    expect(audioCore.state.isPaused).toBeTruthy();
  });

  test("should get average audio level", () => {
    const mockData = new Uint8Array([128, 255, 64, 192]);
    audioCore.data = mockData;
    const level = audioCore.getAverageAudioLevel();
    expect(level).toBeGreaterThanOrEqual(0);
    expect(level).toBeLessThanOrEqual(1);
  });

  // test('should update volume correctly', () => {
  //     const newVolume = 0.5;
  //     audioCore.audioControls.volume = newVolume;
  //     audioCore.updateVolume();
  //     expect(global.localStorage.setItem).toHaveBeenCalledWith('audioVolume', newVolume.toString());
  // });

  // test('should handle mute/unmute correctly', () => {
  //     audioCore.audioControls.volume = 0.8;
  //     const initialVolume = audioCore.audioControls.volume;

  //     // Test mute
  //     audioCore.audioControls.isMuted = true;
  //     audioCore.updateVolume();
  //     expect(audioCore.audioControls.previousVolume).toBe(initialVolume);
  //     expect(audioCore.audioControls.volume).toBe(0);

  //     // Test unmute
  //     audioCore.audioControls.isMuted = false;
  //     audioCore.updateVolume();
  //     expect(audioCore.audioControls.volume).toBe(initialVolume);
  // });

  // test('should load saved volume on initialization', () => {
  //     const savedVolume = '0.7';
  //     global.localStorage.getItem.mockReturnValue(savedVolume);
  //     const newAudioCore = new AudioCore();
  //     expect(newAudioCore.audioControls.volume).toBe(parseFloat(savedVolume));
  // });
});
