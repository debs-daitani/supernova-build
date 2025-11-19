class ScreenRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.startTime = null;
    this.pauseTime = 0;
    this.isPaused = false;
  }

  // Check if screen recording is supported
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  // Start recording
  async start(options = {}) {
    const {
      recordingType = 'screen', // 'screen', 'window', 'tab'
      includeSystemAudio = false,
      includeMicrophone = false,
      includeCursor = true,
      mimeType = 'video/webm;codecs=vp9'
    } = options;

    try {
      // Request screen capture
      const displayMediaOptions = {
        video: {
          cursor: includeCursor ? 'always' : 'never',
          displaySurface: recordingType === 'window' ? 'window' : recordingType === 'tab' ? 'browser' : 'monitor'
        },
        audio: includeSystemAudio
      };

      this.stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // Add microphone if enabled
      if (includeMicrophone) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true
          });

          // Combine audio tracks
          const audioTrack = audioStream.getAudioTracks()[0];
          this.stream.addTrack(audioTrack);
        } catch (err) {
          console.warn('Failed to get microphone:', err);
        }
      }

      // Determine best mime type
      let finalMimeType = mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        const fallbackTypes = [
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4'
        ];

        for (const type of fallbackTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            finalMimeType = type;
            break;
          }
        }
      }

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: finalMimeType
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Handle when user stops screen share from browser UI
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.stop();
        }
      });

      this.startTime = Date.now();
      this.mediaRecorder.start(100); // Collect data every 100ms

      return {
        success: true,
        mimeType: finalMimeType
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording: ' + error.message);
    }
  }

  // Pause recording
  pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pauseTime = Date.now();
    }
  }

  // Resume recording
  resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }

  // Stop recording
  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder.mimeType
        });

        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        // Stop all tracks
        this.stream.getTracks().forEach(track => track.stop());

        resolve({
          blob,
          duration,
          mimeType: this.mediaRecorder.mimeType,
          url: URL.createObjectURL(blob)
        });

        // Cleanup
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.startTime = null;
      };

      this.mediaRecorder.stop();
    });
  }

  // Get current recording duration
  getDuration() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  // Get recording state
  getState() {
    return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
  }

  // Cancel recording without saving
  cancel() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.startTime = null;
  }

  // Generate thumbnail from video blob
  static async generateThumbnail(videoBlob, timeInSeconds = 0) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(timeInSeconds, video.duration);
      });

      video.addEventListener('seeked', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(video.src);
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });

      video.addEventListener('error', (e) => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to generate thumbnail'));
      });

      video.src = URL.createObjectURL(videoBlob);
      video.load();
    });
  }

  // Convert blob to file
  static blobToFile(blob, filename) {
    return new File([blob], filename, {
      type: blob.type,
      lastModified: Date.now()
    });
  }
}

export default ScreenRecorder;
