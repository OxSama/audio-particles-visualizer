particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 100, // increased number of particles
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": ["#fc0303", "#fcdb03", "#039dfc", "#fc03ca", "#03fc20"] // Array of vibrant colors
        },
        "shape": {
            "type": ["circle", "edge", "triangle"], // Variety of shapes
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
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
            "value": 5, // Slightly smaller particles
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

    // Divide the frequency data into two halves
    let lowerHalfArray = data.slice(0, (data.length / 2) - 1);
    let upperHalfArray = data.slice((data.length / 2) - 1, data.length - 1);

    let overallAvg = arrayAverage(data);
    let lowerMax = max(lowerHalfArray);
    let lowerAvg = arrayAverage(lowerHalfArray);
    let upperMax = max(upperHalfArray);
    let upperAvg = arrayAverage(upperHalfArray);

    let speed = overallAvg;
    let maxSpeed = 1;

    const lowerMaxNormalized = lowerMax / 256;
    const upperMaxNormalized = upperMax / 256;

    for (let i = 0; i < pJS.particles.array.length; i++) {
        let particle = pJS.particles.array[i];

        const sizeMultiplier = 10;  // Increase the size multiplier
        const speedMultiplier = upperAvg / 256;

        const baseSpeed = 2;
        particle.vx = baseSpeed * speedMultiplier;
        particle.vy = baseSpeed * speedMultiplier;

        particle.vm = particle.vm || particle.radius;

        // Modify particle size according to the bass (lower frequencies)
        particle.radius = particle.vm * (1 + lowerMaxNormalized * sizeMultiplier);

        // We need to limit the minimum and maximum size of particles
        const maxSize = 20; // You can adjust this as needed
        const minSize = 1;  // You can adjust this as needed
        particle.radius = Math.min(maxSize, Math.max(minSize, particle.radius));

        let currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (currentSpeed > maxSpeed) {
            particle.vx = (particle.vx / currentSpeed) * maxSpeed;
            particle.vy = (particle.vy / currentSpeed) * maxSpeed;
        }
    }

    if (isPlaying) {
        requestAnimationFrame(loop);
    }
}


// A couple of helper functions
function arrayAverage(array) {
    if (array.length === 0) return null;
    let sum = array.reduce((previous, current) => current += previous);
    return sum / array.length;
}

function max(array) {
    return Math.max.apply(null, array);
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