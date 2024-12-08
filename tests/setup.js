// Mock Web Audio API
// class AudioContextMock {
//     constructor() {
//         this.state = 'suspended';
//         this.destination = {};
//     }

//     createAnalyser() {
//         return {
//             connect: jest.fn(),
//             disconnect: jest.fn(),
//             fftSize: 2048,
//             frequencyBinCount: 1024,
//             getByteFrequencyData: jest.fn()
//         };
//     }

//     createGain() {
//         return {
//             connect: jest.fn(),
//             disconnect: jest.fn(),
//             gain: { value: 1 }
//         };
//     }

//     createBufferSource() {
//         return {
//             connect: jest.fn(),
//             disconnect: jest.fn(),
//             start: jest.fn(),
//             stop: jest.fn(),
//             onended: jest.fn()
//         };
//     }

//     decodeAudioData(buffer) {
//         return Promise.resolve({
//             duration: 100,
//             length: 100
//         });
//     }

//     resume() {
//         this.state = 'running';
//         return Promise.resolve();
//     }

//     suspend() {
//         this.state = 'suspended';
//         return Promise.resolve();
//     }

//     close() {
//         this.state = 'closed';
//         return Promise.resolve();
//     }
// }

// Mock Web Audio API
class AudioContextMock {
  constructor() {
    this.state = "suspended";
    this.destination = {};
  }

  createAnalyser() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: jest.fn((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }),
    };
  }

  createGain() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: { value: 1 },
    };
  }

  createBufferSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      onended: jest.fn(),
    };
  }

  decodeAudioData(buffer) {
    return Promise.resolve({
      duration: 100,
      length: 100,
    });
  }

  resume() {
    this.state = "running";
    return Promise.resolve();
  }

  suspend() {
    this.state = "suspended";
    return Promise.resolve();
  }

  close() {
    this.state = "closed";
    return Promise.resolve();
  }
}
// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  }),
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

// Setup global mocks
global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;
global.localStorage = localStorageMock;

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock canvas
const createCanvasMock = () => {
  const canvas = {
    getContext: () => ({
      canvas: {
        width: 800,
        height: 600,
      },
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      setTransform: jest.fn(),
      scale: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
    }),
    toDataURL: jest.fn(),
    style: {},
  };
  return canvas;
};

// Mock HTMLCanvasElement prototype
HTMLCanvasElement.prototype.getContext = function () {
  return createCanvasMock().getContext();
};

global.particlesJS = jest.fn(() => ({
  particles: {
    array: [],
  },
}));

global.pJSDom = [
  {
    pJS: {
      particles: {
        array: [],
        move: {
          speed: 1,
        },
        color: {
          value: "#ffffff",
        },
        line_linked: {
          color: "#ffffff",
        },
      },
      fn: {
        particlesRefresh: jest.fn(),
      },
    },
  },
];

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  }),
);
