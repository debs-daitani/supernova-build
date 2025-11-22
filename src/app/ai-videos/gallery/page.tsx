'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Film, Download, Trash2, RefreshCw, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AI_VIDEO_STYLES, AI_VIDEO_MODELS } from '@/lib/ai-video-config'

export default function VideoGalleryPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'my' | 'public'>('my')
  const [styleFilter, setStyleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [filter, styleFilter, statusFilter])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const userId = 'user_placeholder' // TODO: Get from auth
      const params = new URLSearchParams()

      if (filter === 'my') params.set('userId', userId)
      if (filter === 'public') params.set('public', 'true')
      if (styleFilter) params.set('style', styleFilter)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/ai-videos?${params}`)
      const data = await res.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const res = await fetch(`/api/ai-videos/${videoId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  const filteredVideos = videos.filter((video) => {
    if (!searchQuery) return true
    return video.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Video Gallery
            </h1>
            <p className="text-gray-600">Browse and manage your AI-generated videos</p>
          </div>

          <Link href="/ai-videos/generate">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
              <Film className="w-4 h-4 mr-2" />
              Generate New
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* View Filter */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
            >
              All Videos
            </Button>
            <Button
              variant={filter === 'my' ? 'default' : 'outline'}
              onClick={() => setFilter('my')}
              className={filter === 'my' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
            >
              My Videos
            </Button>
            <Button
              variant={filter === 'public' ? 'default' : 'outline'}
              onClick={() => setFilter('public')}
              className={filter === 'public' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
            >
              Public Gallery
            </Button>
          </div>

          {/* Search and Style Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Input
                type="search"
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Style Filter */}
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">All Styles</option>
              {Object.entries(AI_VIDEO_STYLES).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="GENERATING">Generating</option>
              <option value="QUEUED">Queued</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start generating videos to see them here'}
            </p>
            <Link href="/ai-videos/generate">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                Generate Video
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden group">
                <Link href={`/ai-videos/${video.id}`}>
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative cursor-pointer">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.prompt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="w-16 h-16 text-gray-400" />
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                      </span>
                    </div>

                    {/* Duration */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                        {video.duration}s
                      </div>
                    )}

                    {/* Play Overlay */}
                    {video.status === 'COMPLETED' && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.prompt}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="capitalize">{video.style.toLowerCase()}</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {video.status === 'COMPLETED' && (
                      <>
                        <Link href={`/ai-videos/${video.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Play className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(video.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
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
