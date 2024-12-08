export default class AudioCore {
    constructor() {
        // Initialize audio context with fallback
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048; // Power of 2: 32, 64, 128, 256, 512, 1024, 2048
        this.analyser.smoothingTimeConstant = 0.8; // Smooth changes: 0-1 (default 0.8)
        this.analyser.minDecibels = -70; // Increase sensitivity
        this.analyser.maxDecibels = -30; // Adjust peak response
    
        // Create a persistent gain node
        this.gainNode = this.audioContext.createGain();
    
        // Set up the audio graph in correct order
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        // Initialize frequency data array AFTER setting fftSize
        this.data = new Uint8Array(this.analyser.frequencyBinCount);

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
            currentIndex: 0,
            currentFile: null  // Add this to handle uploaded files
        };

        // Frequency data array
        this.data = new Uint8Array(this.analyser.frequencyBinCount);

        this.resumeContext();

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

    async resumeContext() {
        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
        } catch (error) {
            console.error('Error resuming audio context:', error);
        }
    }

    async loadFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.playlist.currentFile = file;
            return true;
        } catch (error) {
            console.error('Error loading file:', error);
            return false;
        }
    }
    
    clearUploadedFile() {
        this.playlist.currentFile = null;
        this.buffer = null;
    }

    loadSavedVolume() {
        const savedVolume = localStorage.getItem('audioVolume');
        if (savedVolume !== null) {
            this.audioControls.volume = parseFloat(savedVolume);
        }
    }

    async loadTrack(trackIndex, autoPlay = true) {
        try {
            // Resume context first
            await this.resumeContext();

            if (this.playlist.currentFile) {
                return await this.loadFile(this.playlist.currentFile);
            }

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

    getAudioData() {
        if (!this.analyser) {
            console.warn('Analyser not initialized');
            return new Uint8Array();
        }
    
        try {
            // Clear previous data
            this.data.fill(0);
            
            // Get new frequency data
            this.analyser.getByteFrequencyData(this.data);
            
            // Verify we have data
            const hasData = this.data.some(value => value > 0);
            if (!hasData) {
                console.log('No audio data detected');
                return this.data;
            }
            
            // Log data stats for debugging
            const max = Math.max(...this.data);
            const avg = this.data.reduce((sum, val) => sum + val, 0) / this.data.length;
            console.log(`Audio Data - Max: ${max}, Avg: ${avg.toFixed(2)}`);
            
            return this.data;
        } catch (error) {
            console.error('Error getting audio data:', error);
            return new Uint8Array();
        }
    }

    async handlePlay() {
        try {
            await this.resumeContext();
            
            if (!this.buffer) {
                console.log('Loading track...');
                const loaded = await this.loadTrack(this.playlist.currentIndex);
                if (!loaded) {
                    console.error('Failed to load track');
                    return;
                }
            }
    
            if (this.audioSource) {
                this.audioSource.disconnect();
            }
    
            // Create and configure source
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.buffer;
    
            // Connect in correct order
            this.audioSource.connect(this.gainNode);
            // gainNode is already connected to analyser from constructor
    
            const offset = this.state.isPaused ? 
                this.timing.pausedAt - this.timing.startTime : 0;
    
            this.audioSource.start(0, offset);
            this.audioSource.onended = this.handleAudioEnd;
    
            // Set state
            this.state.isPlaying = true;
            this.state.isPaused = false;
            this.timing.startTime = this.audioContext.currentTime - offset;
    
            // Update volume
            this.updateVolume();
            
            console.log('Playback started, audio graph connected');
        } catch (error) {
            console.error('Error in handlePlay:', error);
        }
    }

    handlePause() {
        if (this.state.isPlaying && this.audioSource) {
            this.audioSource.stop();
            this.state.isPlaying = false;
            this.state.isPaused = true;
            this.timing.pausedAt = this.audioContext.currentTime;
        }
    }

    handleStop() {
        if ((this.state.isPlaying || this.state.isPaused) && this.audioSource) {
            this.audioSource.stop();
            this.audioSource.disconnect();
            this.audioSource = null;

            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.isStopped = true;
            this.timing.startTime = 0;
            this.timing.pausedAt = 0;
        }
    }

    // Modified handleAudioEnd to handle both modes
    handleAudioEnd() {
        if (!this.state.isStopped) {
            if (this.audioControls.isLooping) {
                this.handlePlay();
            } else if (!this.playlist.currentFile) {
                // Only cycle through playlist if not playing an uploaded file
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
        if (this.gainNode) {
            this.gainNode.gain.value = this.audioControls.volume;
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

}