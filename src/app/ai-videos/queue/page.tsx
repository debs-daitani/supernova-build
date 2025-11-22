'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, CheckCircle, XCircle, Loader, Film, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatWaitTime, formatDuration } from '@/lib/ai-video-utils'

export default function QueuePage() {
  const [queueData, setQueueData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/ai-videos/queue')
      const data = await res.json()
      setQueueData(data)
    } catch (error) {
      console.error('Error fetching queue:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Generation Queue
          </h1>
          <p className="text-gray-600">Track your video generation status</p>
        </div>

        {/* Current Queue Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">In Queue</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {queueData?.queue?.length || 0}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {queueData?.completed?.length || 0}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Failed</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">
              {queueData?.failed?.length || 0}
            </div>
          </Card>
        </div>

        {/* Currently Generating */}
        {queueData?.currentlyGenerating && (
          <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Loader className="w-6 h-6 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Currently Generating</h3>
                <p className="text-sm text-blue-700 line-clamp-1">
                  {queueData.currentlyGenerating.prompt}
                </p>
              </div>
              <Link href={`/ai-videos/${queueData.currentlyGenerating.id}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Queued Videos */}
        {queueData?.queue && queueData.queue.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">In Queue</h2>
            <div className="space-y-4">
              {queueData.queue.map((video: any, index: number) => (
                <Card key={video.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-700 font-bold">#{video.queuePosition}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 line-clamp-2">{video.prompt}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Film className="w-4 h-4" />
                          {video.duration}s
                        </span>
                        <span className="capitalize">{video.style.toLowerCase()}</span>
                        <span>{video.model}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Est. wait: {formatWaitTime(video.estimatedWaitTime)}
                        </span>
                      </div>
                    </div>
                    <Link href={`/ai-videos/${video.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Videos */}
        {queueData?.completed && queueData.completed.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recently Completed</h2>
              <Link href="/ai-videos/gallery">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queueData.completed.slice(0, 6).map((video: any) => (
                <Link key={video.id} href={`/ai-videos/${video.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative group">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="w-12 h-12 text-gray-400" />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-700 line-clamp-2">{video.prompt}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{new Date(video.generatedAt).toLocaleString()}</span>
                        {video.generationTime && (
                          <span>{formatDuration(video.generationTime)}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Failed Videos */}
        {queueData?.failed && queueData.failed.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Failed</h2>
            <div className="space-y-4">
              {queueData.failed.slice(0, 5).map((video: any) => (
                <Card key={video.id} className="p-6 bg-red-50 border-red-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 line-clamp-1">{video.prompt}</h3>
                      <p className="text-sm text-red-700 mb-2">
                        {video.errorMessage || 'Generation failed'}
                      </p>
                      <div className="text-xs text-red-600">
                        {new Date(video.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Link href={`/ai-videos/${video.id}`}>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Try Again
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!queueData?.queue?.length &&
          !queueData?.currentlyGenerating &&
          !queueData?.completed?.length &&
          !queueData?.failed?.length && (
            <Card className="p-12 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No videos in queue</h3>
              <p className="text-gray-600 mb-6">Start generating videos to see them here</p>
              <Link href="/ai-videos/generate">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Generate Video
                </Button>
              </Link>
            </Card>
          )}
      </div>
    </div>
  )
}
