particlesJS('particles-js', {
    "particles": {
      "number": {
        "value": 80,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#ffffff"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": 5
        },
        "image": {
          "src": "img/github.svg",
          "width": 100,
          "height": 100
        }
      },
      "opacity": {
        "value": 0.5,
        "random": false,
        "anim": {
          "enable": false,
          "speed": 1,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 10,
        "random": true,
        "anim": {
          "enable": false,
          "speed": 80,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 300,
        "color": "#ffffff",
        "opacity": 0.4,
        "width": 2
      },
      "move": {
        "enable": true,
        "speed": 12,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": false,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": false,
          "mode": "repulse"
        },
        "onclick": {
          "enable": true,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 800,
          "line_linked": {
            "opacity": 1
          }
        },
        "bubble": {
          "distance": 800,
          "size": 80,
          "duration": 2,
          "opacity": 0.8,
          "speed": 3
        },
        "repulse": {
          "distance": 400,
          "duration": 0.4
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true
  });

var audioContext = new AudioContext();
var analyser = audioContext.createAnalyser();
var audioSource = null;
var data = new Uint8Array(analyser.frequencyBinCount);
var isPlaying = false;

function loop() {
    analyser.getByteFrequencyData(data);
    var pJS = window.pJSDom[0].pJS;
    for (let i = 0; i < pJS.particles.array.length; i++) {
        let particle = pJS.particles.array[i];
        particle.radius = data[i % data.length] / 20;
    }
    if (isPlaying) {
        requestAnimationFrame(loop);
    }
}

document.getElementById('audioFile').addEventListener('change', function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        audioContext.decodeAudioData(e.target.result, function (buffer) {
            if (audioSource != null) {
                audioSource.disconnect();
            }
            audioSource = audioContext.createBufferSource();
            audioSource.buffer = buffer;
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);
        });
    };
    reader.readAsArrayBuffer(file);

    var audioPlayer = document.getElementById('audioPlayer');
    var seekBar = document.getElementById('seekBar');

    audioPlayer.ontimeupdate = function () {
        var value = (100 / audioPlayer.duration) * audioPlayer.currentTime;
        seekBar.value = value;
    }

    seekBar.addEventListener("change", function () {
        var currentTime = audioPlayer.duration * (seekBar.value / 100);
        audioPlayer.currentTime = currentTime;
    });
});

document.getElementById('playButton').addEventListener('click', function () {
    if (!isPlaying && audioSource) {
        audioSource.start(0);
        isPlaying = true;
        loop();
    }
});

document.getElementById('pauseButton').addEventListener('click', function () {
    if (isPlaying) {
        audioSource.stop();
        isPlaying = false;
    }
});

document.getElementById('stopButton').addEventListener('click', function () {
    if (isPlaying) {
        audioSource.stop();
        audioSource = null;
        isPlaying = false;
    }
});