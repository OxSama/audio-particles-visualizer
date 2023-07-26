let particlesInitialConfig = {
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
            "type": ["circle", "edge", "triangle"], // letiety of shapes
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
                "speed": 0.5,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 5,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 1,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 300,
            "color": "#ffffff",
            "opacity": 0.05,
            "width": 2
        },
        "move": {
            "enable": true,
            "speed": 2,
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
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": true,
                "mode": "repulse"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 800,
                "line_linked": {
                    "opacity": 0.1
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
};
particlesJS('particles-js', particlesInitialConfig);

let audioContext = new AudioContext();
let analyser = audioContext.createAnalyser();
let audioSource = null;
let data = new Uint8Array(analyser.frequencyBinCount);
let isPlaying = false;
let buffer = null;

let audioPlayer = document.getElementById('audioPlayer');
let seekBar = document.getElementById('seekBar');

function loop() {
    analyser.getByteFrequencyData(data);
    let pJS = window.pJSDom[0].pJS;

    // Divide the frequency data into two halves
    let lowerHalfArray = data.slice(0, (data.length / 2) - 1);
    let upperHalfArray = data.slice((data.length / 2) - 1, data.length - 1);

    let lowerMax = max(lowerHalfArray);
    let upperAvg = arrayAverage(upperHalfArray);

    let maxSpeed = 1;

    const lowerMaxNormalized = lowerMax / 256;

    for (const element of pJS.particles.array) {
        let particle = element;

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
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
        audioContext.decodeAudioData(e.target.result, function (decodedBuffer) {
            buffer = decodedBuffer;
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


    audioPlayer.ontimeupdate = function () {
        let value = (100 / audioPlayer.duration) * audioPlayer.currentTime;
        seekBar.value = value;
    }

    seekBar.addEventListener("change", function () {
        let currentTime = audioPlayer.duration * (seekBar.value / 100);
        audioPlayer.currentTime = currentTime;
    });
});

document.getElementById('playButton').addEventListener('click', function () {
    if (!isPlaying && audioSource) {
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = buffer;
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        audioSource.start(0);
        isPlaying = true;
        loop();
    }
});

document.getElementById('pauseButton').addEventListener('click', function () {
    if (isPlaying) {
        audioSource.disconnect();
        audioSource = null;
        isPlaying = false;
        let pJS = window.pJSDom[0].pJS;
        console.log(pJS.particles.array[0]);
        console.log(pJS);
        console.log(pJS.particles.move);
        pJS.particles.move.random = true;
        // for (let i = 0; i < pJS.particles.array.length; i++) {
        //     let particle = pJS.particles.array[i];
        //     particle.vx = particlesInitialConfig.particles.move.speed; // or any other initial value you want
        //     particle.vy = particlesInitialConfig.particles.move.speed; // or any other initial value you want
        //     particle.radius = particlesInitialConfig.particles.size.value; // or any other initial value you want
        // }
    }

});

document.getElementById('stopButton').addEventListener('click', function () {
    if (isPlaying) {
        audioSource.stop();
        audioSource = null;
        isPlaying = false;
    }
});

audioPlayer.addEventListener('ended', function () {
    let pJS = window.pJSDom[0].pJS;
    particlesJS('particles-js', particlesInitialConfig);

    console.log("The audio track has ended, particles behavior is reset.");
    // do something when the audio track has ended...
    if (isPlaying) {
        isPlaying = false;
    }
});