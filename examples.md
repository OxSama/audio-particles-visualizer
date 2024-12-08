# Audio Visualizer Examples

This directory contains examples demonstrating various features and use cases of the Audio Particles Visualizer.

## Basic Example

`basic.html` - Simple setup with default configuration

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Basic Audio Visualizer</title>
    <style>
      #particles-js {
        width: 100vw;
        height: 100vh;
        background: #000;
      }
    </style>
  </head>
  <body>
    <div id="particles-js"></div>
    <audio id="audio" src="path/to/your/audio.mp3"></audio>

    <script src="../dist/audio-visualizer.min.js"></script>
    <script>
      const visualizer = new AudioVisualizer({
        container: "#particles-js",
        audio: "#audio",
      });
    </script>
  </body>
</html>
```

## Advanced Example

`advanced.html` - Advanced setup with custom configuration and control panel

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Advanced Audio Visualizer</title>
    <style>
      #particles-js {
        width: 100vw;
        height: 100vh;
        background: #000;
      }
    </style>
  </head>
  <body>
    <div id="particles-js"></div>
    <audio id="audio" src="path/to/your/audio.mp3"></audio>

    <script src="../dist/audio-visualizer.min.js"></script>
    <script>
      const visualizer = new AudioVisualizer({
        container: "#particles-js",
        audio: "#audio",
        options: {
          mode: "pulse",
          colorPalette: "sunset",
          sensitivity: 1.5,
          particleCount: 100,
          showStats: true,
        },
        showControls: true,
      });

      // Event handling
      visualizer.on("play", () => console.log("Playing"));
      visualizer.on("pause", () => console.log("Paused"));
    </script>
  </body>
</html>
```

## Playlist Example

`playlist.html` - Example with multiple tracks and playlist controls

## Custom Mode Example

`custom-mode.html` - Example showing how to create a custom visualization mode

## Color Themes Example

`themes.html` - Example demonstrating different color palettes and themes

Each example includes detailed comments explaining the code and configuration options used.
