'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  Trash2,
  RefreshCw,
  Share2,
  Film,
  Clock,
  Zap,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDuration, formatWaitTime } from '@/lib/ai-video-utils'

export default function VideoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.id as string

  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (videoId) {
      fetchVideo()
    }
  }, [videoId])

  const fetchVideo = async () => {
    try {
      const res = await fetch(`/api/ai-videos/${videoId}`)
      const data = await res.json()
      setVideo(data)
    } catch (error) {
      console.error('Error fetching video:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (video.videoUrl) {
      window.open(video.videoUrl, '_blank')
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)

    try {
      const res = await fetch(`/api/ai-videos/${videoId}/regenerate`, {
        method: 'POST',
      })

      if (res.ok) {
        const newVideo = await res.json()
        router.push(`/ai-videos/${newVideo.id}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to regenerate video')
      }
    } catch (error) {
      console.error('Error regenerating video:', error)
      alert('Failed to regenerate video')
    } finally {
      setRegenerating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video?')) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/ai-videos/${videoId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/ai-videos/gallery')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Failed to delete video')
    } finally {
      setDeleting(false)
    }
  }

  const togglePublic = async () => {
    try {
      const res = await fetch(`/api/ai-videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !video.isPublic }),
      })

      if (res.ok) {
        fetchVideo()
      }
    } catch (error) {
      console.error('Error updating video:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <Link href="/ai-videos/gallery">
            <Button>Back to Gallery</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Video Details
          </h1>
          <p className="text-gray-600">
            Created {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden mb-6">
              <div className="aspect-video bg-black flex items-center justify-center relative">
                {video.status === 'COMPLETED' && video.videoUrl ? (
                  <video
                    src={video.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full"
                  />
                ) : video.status === 'GENERATING' || video.status === 'QUEUED' ? (
                  <div className="text-center text-white p-8">
                    <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold mb-2">{video.status}</h3>
                    <p className="text-gray-300">
                      Your video is being generated. This may take a few minutes.
                    </p>
                  </div>
                ) : video.status === 'FAILED' ? (
                  <div className="text-center text-white p-8">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">!</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
                    <p className="text-gray-300 mb-4">
                      {video.errorMessage || 'An error occurred during generation'}
                    </p>
                    <Button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="bg-gradient-to-r from-pink-500 to-purple-500"
                    >
                      {regenerating ? 'Regenerating...' : 'Try Again'}
                    </Button>
                  </div>
                ) : (
                  <Film className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </Card>

            {/* Actions */}
            {video.status === 'COMPLETED' && (
              <div className="flex gap-3 mb-6">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {regenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
                <Button onClick={togglePublic} variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  {video.isPublic ? 'Make Private' : 'Make Public'}
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="outline"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Prompt */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Prompt</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{video.prompt}</p>

              {video.negativePrompt && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold mb-2">Negative Prompt</h3>
                  <p className="text-gray-600">{video.negativePrompt}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Status</h3>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  video.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : video.status === 'GENERATING'
                    ? 'bg-blue-100 text-blue-700'
                    : video.status === 'QUEUED'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {video.status}
              </div>

              {video.generatedAt && (
                <div className="mt-4 text-sm text-gray-600">
                  Generated: {new Date(video.generatedAt).toLocaleString()}
                </div>
              )}

              {video.generationTime && (
                <div className="mt-2 text-sm text-gray-600">
                  Generation time: {formatDuration(video.generationTime)}
                </div>
              )}
            </Card>

            {/* Settings Used */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings Used
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Model</span>
                  <span className="font-semibold">{video.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Style</span>
                  <span className="font-semibold capitalize">
                    {video.style.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{video.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aspect Ratio</span>
                  <span className="font-semibold">{video.aspectRatio}</span>
                </div>
                {video.motionIntensity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Motion Intensity</span>
                    <span className="font-semibold">{video.motionIntensity}/10</span>
                  </div>
                )}
                {video.cameraMovement && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Camera Movement</span>
                    <span className="font-semibold capitalize">
                      {video.cameraMovement.toLowerCase()}
                    </span>
                  </div>
                )}
                {video.seed && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seed</span>
                    <span className="font-mono text-xs">{video.seed}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Creator */}
            {video.user && (
              <Card className="p-6">
                <h3 className="font-bold mb-4">Created By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {video.user.profilePhotoUrl ? (
                      <img
                        src={video.user.profilePhotoUrl}
                        alt={video.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      video.user.name?.[0] || 'U'
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{video.user.name}</div>
                    {video.user.username && (
                      <div className="text-sm text-gray-600">@{video.user.username}</div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Visibility */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Visibility</h3>
              <p className="text-sm text-gray-600 mb-3">
                {video.isPublic
                  ? 'This video is public and visible in the gallery'
                  : 'This video is private and only visible to you'}
              </p>
              <Button onClick={togglePublic} variant="outline" className="w-full">
                {video.isPublic ? 'Make Private' : 'Make Public'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
