export default class AudioCore {
    constructor() {
        // Initialize audio context with fallback
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
    
        // Initialize audio source as null
        this.audioSource = null;
        
        // Initialize state
        this.state = {
            isPlaying: false,
            isPaused: false,
            isStopped: true
        };
        
        // Timing information
        this.timing = {
            startTime: 0,
            pausedAt: 0
        };
        
        // Audio buffer
        this.buffer = null;

        // Audio controls
        this.audioControls = {
            volume: 1,
            isMuted: false,
            previousVolume: 1,
            isLooping: false
        };
        
        // Playlist configuration
        this.playlist = {
            tracks: [
                'https://dl.dropboxusercontent.com/scl/fi/8km1bqcn5352t7ep4sapd/01.-STARGAZING.mp3?rlkey=mhdfkxqqm2lypqzq4w2xsnwrw&st=fb8lu7or&dl=0',
                'https://dl.dropboxusercontent.com/scl/fi/eyhxveg8ed9o89l9qvhg2/03.-SICKO-MODE.mp3?rlkey=o42gwx5ndu4tkawnjfku1cn5f&st=q6d6z2yb&dl=0'
            ],
            currentIndex: 0
        };

        // Frequency data array
        this.data = new Uint8Array(this.analyser.frequencyBinCount);

        // Bind methods
        this.handleAudioEnd = this.handleAudioEnd.bind(this);
        this.handlePlay = this.handlePlay.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.handlePause = this.handlePause.bind(this);

        // Load initial track
        this.loadTrack(this.playlist.currentIndex, false);

        // Load saved volume settings
        this.loadSavedVolume();
    }

    loadSavedVolume() {
        const savedVolume = localStorage.getItem('audioVolume');
        if (savedVolume !== null) {
            this.audioControls.volume = parseFloat(savedVolume);
        }
    }

    async loadTrack(trackIndex, autoPlay = true) {
        try {
            const response = await fetch(this.playlist.tracks[trackIndex]);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            if (autoPlay && !this.state.isStopped) {
                await this.handlePlay();
            }

            return true;
        } catch (error) {
            console.error('Error loading track:', error);
            return false;
        }
    }

    async handlePlay() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.state.isStopped = false;

        if (this.audioSource) {
            this.audioSource.disconnect();
        }

        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.buffer;
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        const offset = this.state.isPaused ? 
            this.timing.pausedAt - this.timing.startTime : 0;

        this.audioSource.start(0, offset);
        this.audioSource.onended = () => this.handleAudioEnd();

        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.timing.startTime = this.audioContext.currentTime - offset;
    }

    handlePause() {
        if (this.state.isPlaying) {
            this.audioSource.stop();
            this.state.isPlaying = false;
            this.state.isPaused = true;
            this.timing.pausedAt = this.audioContext.currentTime;
        }
    }

    handleStop() {
        if (this.state.isPlaying || this.state.isPaused) {
            if (this.audioSource) {
                this.audioSource.stop();
                this.audioSource = null;
            }

            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.isStopped = true;
            this.timing.startTime = 0;
            this.timing.pausedAt = 0;
        }
    }

    handleAudioEnd() {
        if (!this.state.isStopped) {
            if (this.audioControls.isLooping) {
                this.handlePlay();
            } else {
                this.playlist.currentIndex = (this.playlist.currentIndex + 1) % this.playlist.tracks.length;
                this.loadTrack(this.playlist.currentIndex, true);
            }
        }
    }

    seekTo(time) {
        if (!this.buffer) return;
        
        const wasPlaying = this.state.isPlaying;
        const newTime = Math.min(Math.max(0, time), this.buffer.duration);

        if (this.audioSource) {
            this.audioSource.stop();
            this.audioSource.disconnect();
        }

        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.buffer;
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        this.timing.startTime = this.audioContext.currentTime - newTime;
        this.timing.pausedAt = 0;
        
        if (wasPlaying || !this.state.isPaused) {
            this.audioSource.start(0, newTime);
            this.state.isPlaying = true;
            this.state.isPaused = false;
        } else {
            this.state.isPlaying = false;
            this.state.isPaused = true;
            this.timing.pausedAt = this.audioContext.currentTime;
        }
    }

    updateVolume() {
        if (this.audioSource) {
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = this.audioControls.volume;
            this.audioSource.disconnect();
            this.audioSource.connect(gainNode);
            gainNode.connect(this.analyser);
            
            localStorage.setItem('audioVolume', this.audioControls.volume.toString());
        }
    }

    getAverageAudioLevel() {
        if (!this.data) return 0;
        return Array.from(this.data).reduce((sum, val) => sum + val, 0) / 
               (this.data.length * 256);
    }

    // Clean up method
    dispose() {
        if (this.audioSource) {
            this.audioSource.stop();
            this.audioSource.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    // Method to get current audio data for visualizer
    getAudioData() {
        this.analyser.getByteFrequencyData(this.data);
        return this.data;
    }
}