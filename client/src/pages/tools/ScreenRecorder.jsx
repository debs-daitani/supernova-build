import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenRecorder from '../../services/screenRecorder';
import demoVideosService from '../../services/demoVideos';
import { uploadFile } from '../../services/api';

export default function ScreenRecorderPage() {
  const navigate = useNavigate();
  const [recorder, setRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');

  // Recording options
  const [recordingType, setRecordingType] = useState('screen');
  const [includeSystemAudio, setIncludeSystemAudio] = useState(false);
  const [includeMicrophone, setIncludeMicrophone] = useState(true);
  const [includeCursor, setIncludeCursor] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const timerInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const newRecorder = new ScreenRecorder();

      await newRecorder.start({
        recordingType,
        includeSystemAudio,
        includeMicrophone,
        includeCursor
      });

      setRecorder(newRecorder);
      setRecording(true);
      setPaused(false);
      setDuration(0);

      // Update duration every second
      timerInterval.current = setInterval(() => {
        setDuration(newRecorder.getDuration());
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please make sure you granted screen sharing permission.');
    }
  };

  const pauseRecording = () => {
    if (recorder) {
      recorder.pause();
      setPaused(true);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }
  };

  const resumeRecording = () => {
    if (recorder) {
      recorder.resume();
      setPaused(false);

      timerInterval.current = setInterval(() => {
        setDuration(recorder.getDuration());
      }, 1000);
    }
  };

  const stopRecording = async () => {
    if (!recorder) return;

    try {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }

      const result = await recorder.stop();
      setRecordedBlob(result.blob);
      setRecordedUrl(result.url);
      setRecording(false);
      setPaused(false);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Failed to stop recording');
    }
  };

  const cancelRecording = () => {
    if (recorder) {
      recorder.cancel();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      setRecorder(null);
      setRecording(false);
      setPaused(false);
      setDuration(0);
    }
  };

  const discardRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setShowPreview(false);
    setTitle('');
    setDuration(0);
  };

  const downloadRecording = () => {
    if (!recordedBlob) return;

    const filename = title ? `${title}.webm` : `recording-${Date.now()}.webm`;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveRecording = async () => {
    if (!recordedBlob) return;

    try {
      setUploading(true);

      // Generate thumbnail
      const thumbnailBlob = await ScreenRecorder.generateThumbnail(recordedBlob, 2);

      // Upload video
      const videoFile = ScreenRecorder.blobToFile(
        recordedBlob,
        title ? `${title}.webm` : `recording-${Date.now()}.webm`
      );
      const videoUploadResult = await uploadFile(videoFile);

      // Upload thumbnail
      const thumbnailFile = ScreenRecorder.blobToFile(
        thumbnailBlob,
        `thumbnail-${Date.now()}.jpg`
      );
      const thumbnailUploadResult = await uploadFile(thumbnailFile);

      // Save to database
      await demoVideosService.uploadRecording({
        title: title || 'Untitled Recording',
        videoUrl: videoUploadResult.url,
        thumbnailUrl: thumbnailUploadResult.url,
        duration,
        recordingType,
        includeAudio: includeSystemAudio || includeMicrophone,
        includeCursor
      });

      alert('Recording saved successfully!');
      discardRecording();
      navigate('/tools/screen-recorder/recordings');
    } catch (error) {
      console.error('Failed to save recording:', error);
      alert('Failed to save recording. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!ScreenRecorder.isSupported()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Browser Not Supported</h2>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support screen recording. Please use a modern browser like Chrome, Edge, or Firefox.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900">Preview Recording</h1>
            </div>

            {/* Video Preview */}
            <div className="bg-black">
              <video
                src={recordedUrl}
                controls
                className="w-full aspect-video"
              />
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter recording title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Duration: {formatTime(duration)}</span>
                <span>Size: {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={saveRecording}
                  disabled={uploading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {uploading ? 'Saving...' : 'Save to My Recordings'}
                </button>
                <button
                  onClick={downloadRecording}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={discardRecording}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🎥 Screen Recorder
            </h1>
            <p className="text-gray-600">
              Record your screen, create demos, tutorials, or bug reports
            </p>
          </div>

          {/* Recording Status */}
          {recording && (
            <div className="bg-red-50 border-b border-red-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-red-900">
                      {paused ? 'PAUSED' : 'RECORDING'}
                    </span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-red-900">
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {paused ? (
                    <button
                      onClick={resumeRecording}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Stop
                  </button>
                  <button
                    onClick={cancelRecording}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Countdown */}
          {countdown > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="text-9xl font-bold text-white animate-pulse">
                  {countdown}
                </div>
                <p className="text-2xl text-white mt-4">Recording starts soon...</p>
              </div>
            </div>
          )}

          {/* Settings */}
          {!recording && (
            <div className="p-6 space-y-6">
              {/* Recording Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What to record
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setRecordingType('screen')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      recordingType === 'screen'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">🖥️</div>
                    <div className="font-semibold">Entire Screen</div>
                  </button>
                  <button
                    onClick={() => setRecordingType('window')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      recordingType === 'window'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">🪟</div>
                    <div className="font-semibold">Window</div>
                  </button>
                  <button
                    onClick={() => setRecordingType('tab')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      recordingType === 'tab'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">🌐</div>
                    <div className="font-semibold">Browser Tab</div>
                  </button>
                </div>
              </div>

              {/* Audio Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Audio options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={includeMicrophone}
                      onChange={(e) => setIncludeMicrophone(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Microphone</div>
                      <div className="text-sm text-gray-500">Record your voice</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={includeSystemAudio}
                      onChange={(e) => setIncludeSystemAudio(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">System Audio</div>
                      <div className="text-sm text-gray-500">Record computer sounds</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Other Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Other options
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={includeCursor}
                    onChange={(e) => setIncludeCursor(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Show Cursor</div>
                    <div className="text-sm text-gray-500">Include cursor in recording</div>
                  </div>
                </label>
              </div>

              {/* Start Button */}
              <div className="pt-4">
                <button
                  onClick={startCountdown}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Start Recording</span>
                </button>
              </div>

              {/* My Recordings Link */}
              <div className="text-center pt-4 border-t">
                <button
                  onClick={() => navigate('/tools/screen-recorder/recordings')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  View My Recordings →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        {!recording && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-3">📹</div>
              <h3 className="font-bold text-gray-900 mb-2">No Downloads</h3>
              <p className="text-gray-600 text-sm">Record directly in your browser, no software needed</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Instant Recording</h3>
              <p className="text-gray-600 text-sm">Start recording with one click, share instantly</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-gray-900 mb-2">Private & Secure</h3>
              <p className="text-gray-600 text-sm">Your recordings stay on your device until you save</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
