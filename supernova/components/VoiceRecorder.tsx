'use client'

import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { useState } from 'react'

interface VoiceRecorderProps {
  userId: string
  conversationId: string | null
  onTranscriptionComplete?: (transcription: string) => void
}

export default function VoiceRecorder({
  userId,
  conversationId,
  onTranscriptionComplete,
}: VoiceRecorderProps) {
  const {
    recordingState,
    recordingDuration,
    audioBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    uploadRecording,
    formatDuration,
  } = useVoiceRecorder()

  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleUpload = async () => {
    setUploadError(null)
    try {
      const result = await uploadRecording(userId, conversationId)
      if (onTranscriptionComplete) {
        onTranscriptionComplete(result.transcription)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  return (
    <div className="voice-recorder">
      {/* Recording Controls */}
      {recordingState === 'idle' && !audioBlob && (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          title="Start voice recording"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
          Record Voice Memo
        </button>
      )}

      {/* Active Recording */}
      {(recordingState === 'recording' || recordingState === 'paused') && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            {recordingState === 'recording' && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            {recordingState === 'paused' && (
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            )}
            <span className="font-mono text-lg font-bold text-white">
              {formatDuration(recordingDuration)}
            </span>
          </div>

          <div className="flex gap-2 ml-auto">
            {recordingState === 'recording' && (
              <button
                onClick={pauseRecording}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
                title="Pause recording"
              >
                Pause
              </button>
            )}

            {recordingState === 'paused' && (
              <button
                onClick={resumeRecording}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                title="Resume recording"
              >
                Resume
              </button>
            )}

            <button
              onClick={stopRecording}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
              title="Stop recording"
            >
              Stop
            </button>

            <button
              onClick={cancelRecording}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
              title="Cancel recording"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Processing Upload */}
      {recordingState === 'processing' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          <span className="text-white">Transcribing with AI...</span>
        </div>
      )}

      {/* Recorded Audio Preview */}
      {recordingState === 'idle' && audioBlob && (
        <div className="flex flex-col gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-white font-medium">
              Recording complete ({formatDuration(recordingDuration)})
            </span>
          </div>

          <audio
            src={URL.createObjectURL(audioBlob)}
            controls
            className="w-full"
          />

          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors font-medium"
            >
              Send & Transcribe
            </button>
            <button
              onClick={cancelRecording}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Discard
            </button>
          </div>

          {uploadError && (
            <div className="text-red-500 text-sm">{uploadError}</div>
          )}
        </div>
      )}
    </div>
  )
}
