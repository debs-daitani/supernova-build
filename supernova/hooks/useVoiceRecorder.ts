import { useState, useRef, useCallback } from 'react'

export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing'

export function useVoiceRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create MediaRecorder with best available format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // Good quality for speech
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        setRecordingState('idle')

        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      mediaRecorder.start()
      setRecordingState('recording')
      setRecordingDuration(0)
      setAudioBlob(null)

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
      setRecordingState('idle')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [recordingState])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [recordingState])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    }
  }, [recordingState])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      chunksRef.current = []
      setAudioBlob(null)
      setRecordingDuration(0)
      setRecordingState('idle')

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const uploadRecording = useCallback(
    async (userId: string, conversationId: string | null): Promise<any> => {
      if (!audioBlob) {
        throw new Error('No audio recorded')
      }

      setRecordingState('processing')

      try {
        const formData = new FormData()
        const filename = `voice-memo-${Date.now()}.webm`
        formData.append('audio', audioBlob, filename)
        formData.append('userId', userId)
        if (conversationId) {
          formData.append('conversationId', conversationId)
        }

        const response = await fetch('/api/voice/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        setRecordingState('idle')
        setAudioBlob(null)
        setRecordingDuration(0)

        return result
      } catch (error) {
        setRecordingState('idle')
        throw error
      }
    },
    [audioBlob]
  )

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
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
  }
}
