'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Video as VideoIcon, Upload, Scissors, Play, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Video {
  id: string
  title: string
  duration: number
  thumbnailUrl: string | null
  status: string
  createdAt: string
  clips: any[]
}

export default function VideoLibraryPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [quotaUsed, setQuotaUsed] = useState(2)
  const [quotaLimit, setQuotaLimit] = useState(4)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      setVideos(data)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('Delete this video and all its clips?')) return

    try {
      await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      setVideos(videos.filter((v) => v.id !== id))
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Video Library
          </h1>
          <p className="text-gray-600">Upload and repurpose videos for social media</p>
        </div>

        {/* Quota Display */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Monthly Quota</h3>
              <p className="text-sm text-gray-600">{quotaUsed} of {quotaLimit} videos used this month</p>
            </div>
            <Link href="/video/upload">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </Link>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
              style={{ width: `${(quotaUsed / quotaLimit) * 100}%` }}
            ></div>
          </div>
        </Card>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <VideoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-gray-600 mb-6">Upload your first video to get started</p>
            <Link href="/video/upload">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <VideoIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 truncate">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(video.duration)}
                    </span>
                    <span>{video.clips?.length || 0} clips</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/video/editor/${video.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/video/clips/new/${video.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Scissors className="w-4 h-4 mr-1" />
                        Clip
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => deleteVideo(video.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
