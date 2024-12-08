# Audio Particles Visualizer

A powerful, customizable audio visualization library that creates stunning particle-based visualizations reacting to your music in real-time.

## Features

🎵 Real-time audio analysis
🎨 Multiple visualization modes (particles, waves, circular)
🎯 Customizable particle effects
🎚️ Advanced audio controls
🎮 Keyboard shortcuts
🌈 Beautiful color palettes
📱 Responsive design
⚡ High performance

## Installation

```bash
npm install audio-particles-visualizer
```

Or include via CDN:

```html
<script src="https://unpkg.com/audio-particles-visualizer"></script>
```

## Quick Start

1. Add container and audio elements:

```html
<div id="particles-js"></div>
<audio id="audio" src="your-audio.mp3"></audio>
```

2. Initialize the visualizer:

```javascript
const visualizer = new AudioVisualizer({
  container: "#particles-js",
  audio: "#audio",
  options: {
    mode: "particles",
    colorPalette: "neon",
    sensitivity: 1.0,
    particleCount: 50,
  },
});
```

## Usage Examples

### Basic Setup

```javascript
// Create visualizer with default settings
const visualizer = new AudioVisualizer({
  container: "#particles-js",
  audio: "#audio",
});
```

### Custom Configuration

```javascript
const visualizer = new AudioVisualizer({
  container: "#particles-js",
  audio: "#audio",
  options: {
    mode: "particles",
    colorPalette: "sunset",
    sensitivity: 1.5,
    particleCount: 100,
    showStats: true,
  },
});
```

### With Control Panel

```javascript
const visualizer = new AudioVisualizer({
  container: "#particles-js",
  audio: "#audio",
  showControls: true,
});
```

## API Reference

### Constructor Options

| Option        | Type           | Default     | Description                   |
| ------------- | -------------- | ----------- | ----------------------------- |
| container     | string/Element | required    | Container element or selector |
| audio         | string/Element | required    | Audio element or selector     |
| mode          | string         | 'particles' | Visualization mode            |
| colorPalette  | string         | 'neon'      | Color palette name            |
| sensitivity   | number         | 1.0         | Audio sensitivity (0.1-2.0)   |
| particleCount | number         | 50          | Number of particles           |
| showControls  | boolean        | false       | Show control panel            |
| showStats     | boolean        | false       | Show performance stats        |

### Methods

#### Audio Control

```javascript
visualizer.play(); // Start audio playback
visualizer.pause(); // Pause audio playback
visualizer.stop(); // Stop audio playback
visualizer.setVolume(0.5); // Set volume (0-1)
```

#### Visualization Control

```javascript
visualizer.setMode("wave"); // Change visualization mode
visualizer.setColorPalette("sunset"); // Change color palette
visualizer.updateSettings({
  // Update multiple settings
  sensitivity: 1.5,
  particleCount: 100,
});
```

### Events

```javascript
visualizer.on("play", () => console.log("Audio started"));
visualizer.on("pause", () => console.log("Audio paused"));
visualizer.on("stop", () => console.log("Audio stopped"));
```

## Available Modes

- `particles`: Classic particle movement
- `wave`: Waveform visualization
- `circular`: Circular particle motion
- `pulse`: Beat-reactive pulsing

## Color Palettes

- `neon`: Bright, cyberpunk-inspired colors
- `sunset`: Warm gradient colors
- `aurora`: Cool, northern lights colors
- `retro`: Synthwave aesthetic
- `galaxy`: Deep space colors

## Keyboard Shortcuts

- `Space`: Play/Pause
- `M`: Mute/Unmute
- `←/→`: Previous/Next track
- `Esc`: Toggle control panel

## Browser Support

- Chrome 49+
- Firefox 52+
- Safari 11+
- Edge 79+
- Opera 36+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © OxSama
