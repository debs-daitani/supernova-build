'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Instagram, Facebook, Linkedin, Share2, ExternalLink, Heart, MessageCircle, Repeat2 } from 'lucide-react'

interface SocialPost {
  id: string
  content: string
  platforms: string[]
  status: string
  publishedAt: string
  externalIds: Record<string, any>
  analytics: Record<string, any>
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Share2,
}

export default function PublishedPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social/posts?status=published')
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
      <div>
        <h2 className="text-2xl font-supernova text-light-teal flex items-center gap-2">
          <CheckCircle size={24} />
          Published Posts
        </h2>
        <p className="text-sm text-gray-400 font-josefin">Your published social media content</p>
      </div>

      {posts.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
          <CheckCircle className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-supernova text-white mb-2">No Published Posts Yet</h3>
          <p className="text-gray-400 font-josefin">
            Posts you publish will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            const analytics = post.analytics as Record<string, any> || {}
            const externalIds = post.externalIds as Record<string, any> || {}

            return (
              <div
                key={post.id}
                className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6"
              >
                {/* Platforms */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    {(post.platforms as string[]).map((platform) => {
                      const Icon = PLATFORM_ICONS[platform] || Share2
                      const platformResult = externalIds[platform]
                      const success = platformResult?.success

                      return (
                        <div
                          key={platform}
                          className={`flex items-center gap-1 px-2 py-1 rounded ${
                            success ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}
                        >
                          <Icon size={14} className={success ? 'text-green-400' : 'text-red-400'} />
                          <span className={`text-xs font-josefin capitalize ${success ? 'text-green-400' : 'text-red-400'}`}>
                            {platform}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <span className="text-xs text-gray-400 font-josefin">
                    {post.publishedAt && new Date(post.publishedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Content */}
                <p className="text-white font-josefin mb-4 line-clamp-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Analytics (if available) */}
                {Object.keys(analytics).length > 0 && (
                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    {analytics.likes !== undefined && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Heart size={14} />
                        <span className="text-sm font-josefin">{analytics.likes}</span>
                      </div>
                    )}
                    {analytics.comments !== undefined && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <MessageCircle size={14} />
                        <span className="text-sm font-josefin">{analytics.comments}</span>
                      </div>
                    )}
                    {analytics.shares !== undefined && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Repeat2 size={14} />
                        <span className="text-sm font-josefin">{analytics.shares}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* External Links */}
                <div className="mt-4 flex gap-2">
                  {(post.platforms as string[]).map((platform) => {
                    const platformResult = externalIds[platform]
                    if (!platformResult?.success || !platformResult?.postId) return null

                    let url = ''
                    if (platform === 'facebook') {
                      url = `https://facebook.com/${platformResult.postId}`
                    } else if (platform === 'instagram') {
                      url = `https://instagram.com/p/${platformResult.postId}`
                    } else if (platform === 'linkedin') {
                      url = `https://linkedin.com/feed/update/${platformResult.postId}`
                    }

                    if (!url) return null

                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-gray-400 text-xs font-josefin hover:bg-white/20 transition-all"
                      >
                        <ExternalLink size={12} />
                        View on {platform}
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
