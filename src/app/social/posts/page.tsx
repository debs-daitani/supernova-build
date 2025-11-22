'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Send,
  Plus,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Music,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface Post {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledFor: string | null
  publishedAt: string | null
  createdAt: string
  engagementStats: any
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock },
  PUBLISHING: { label: 'Publishing', color: 'bg-yellow-100 text-yellow-800', icon: Send },
  PUBLISHED: { label: 'Published', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const PLATFORM_ICONS = {
  TWITTER: Twitter,
  LINKEDIN: Linkedin,
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  TIKTOK: Music,
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)

      const response = await fetch(`/api/social/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/social/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPosts()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  const handleDuplicate = async (postId: string) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/duplicate`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchPosts()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to duplicate post')
      }
    } catch (error) {
      console.error('Failed to duplicate post:', error)
      alert('Failed to duplicate post')
    }
  }

  const getEngagementTotal = (stats: any) => {
    if (!stats) return 0
    return (stats.likes || 0) + (stats.comments || 0) + (stats.shares || 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Social Posts</h1>
                <p className="text-gray-600">Manage your social media content</p>
              </div>
            </div>

            <Link
              href="/social/compose"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Compose Post
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === ''
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setFilter('DRAFT')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'DRAFT'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilter('SCHEDULED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'SCHEDULED'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setFilter('PUBLISHED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'PUBLISHED'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Published
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading posts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-12 text-center">
            <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first social media post to get started.
            </p>
            <Link
              href="/social/compose"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Compose Your First Post
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const statusConfig = STATUS_CONFIG[post.status as keyof typeof STATUS_CONFIG]
              const StatusIcon = statusConfig?.icon || AlertCircle
              const engagement = getEngagementTotal(post.engagementStats)

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        statusConfig?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig?.label || post.status}
                    </span>

                    {/* Platform Icons */}
                    <div className="flex gap-1">
                      {post.platforms.map((platform) => {
                        const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]
                        return Icon ? (
                          <div
                            key={platform}
                            className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"
                            title={platform}
                          >
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-4">{post.content}</p>

                  {/* Schedule/Publish Info */}
                  {post.status === 'SCHEDULED' && post.scheduledFor && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 mb-4 bg-blue-50 px-3 py-2 rounded-lg">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.scheduledFor).toLocaleString()}
                    </div>
                  )}

                  {post.status === 'PUBLISHED' && post.publishedAt && (
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-4 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-3 h-3" />
                      Published {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Engagement Stats */}
                  {post.status === 'PUBLISHED' && engagement > 0 && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{engagement}</div>
                        <div className="text-xs text-gray-500">Total Engagement</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {(post.status === 'DRAFT' || post.status === 'SCHEDULED') && (
                      <>
                        <button
                          onClick={() => handleDuplicate(post.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {post.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleDuplicate(post.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                    )}
                  </div>

                  {/* Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Created {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
