'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Edit2, Trash2, Send, Instagram, Facebook, Linkedin, Share2, Plus } from 'lucide-react'

interface SocialPost {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledFor: string
  createdAt: string
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Share2,
}

export default function ScheduledPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social/posts?status=scheduled')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) return

    try {
      const response = await fetch(`/api/social/posts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id))
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      alert('Failed to delete post')
    }
  }

  const handlePublishNow = async (id: string) => {
    if (!confirm('Publish this post now?')) return

    try {
      const response = await fetch(`/api/social/posts/${id}`, {
        method: 'POST'
      })

      if (response.ok) {
        await fetchPosts()
      } else {
        alert('Failed to publish post')
      }
    } catch (error) {
      alert('Failed to publish post')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal flex items-center gap-2">
            <Clock size={24} />
            Scheduled Posts
          </h2>
          <p className="text-sm text-gray-400 font-josefin">Posts waiting to be published</p>
        </div>
        <Link
          href="/social/compose"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-purple-500 text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.3)] transition-all"
        >
          <Plus size={18} />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
          <Clock className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-supernova text-white mb-2">No Scheduled Posts</h3>
          <p className="text-gray-400 font-josefin mb-4">
            Schedule your first post to see it here
          </p>
          <Link
            href="/social/compose"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-hot-pink/20 text-hot-pink font-josefin hover:bg-hot-pink/30 transition-all"
          >
            <Plus size={18} />
            Create Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Platforms */}
                  <div className="flex gap-2 mb-3">
                    {(post.platforms as string[]).map((platform) => {
                      const Icon = PLATFORM_ICONS[platform] || Share2
                      return (
                        <div
                          key={platform}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-white/10"
                        >
                          <Icon size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-400 font-josefin capitalize">{platform}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Content */}
                  <p className="text-white font-josefin mb-3 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Schedule Time */}
                  <div className="flex items-center gap-2 text-hot-pink font-josefin text-sm">
                    <Clock size={14} />
                    Scheduled for{' '}
                    {new Date(post.scheduledFor).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePublishNow(post.id)}
                    className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                    title="Publish Now"
                  >
                    <Send size={18} />
                  </button>
                  <Link
                    href={`/social/compose?edit=${post.id}`}
                    className="p-2 rounded-lg bg-light-teal/20 text-light-teal hover:bg-light-teal/30 transition-all"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
