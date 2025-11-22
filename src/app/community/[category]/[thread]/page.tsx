'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { MessageSquare, Heart, ThumbsUp, Sparkles, Trophy, Gem, Reply, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { formatTimeAgo, getInitials } from '@/lib/forum-utils'
import { REACTION_TYPES } from '@/lib/forum-config'

const REACTION_ICONS: any = {
  HELPFUL: ThumbsUp,
  LOVE: Heart,
  CELEBRATE: Trophy,
  SPARK: Sparkles,
  ROCKSTAR: Gem,
}

export default function ThreadPage({
  params,
}: {
  params: Promise<{ category: string; thread: string }>
}) {
  const { category: categorySlug, thread: threadSlug } = use(params)
  const [thread, setThread] = useState<any>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThread()
  }, [threadSlug])

  const fetchThread = async () => {
    try {
      const res = await fetch('/api/forum/threads')
      const data = await res.json()
      const foundThread = data.threads.find((t: any) => t.slug === threadSlug)

      if (foundThread) {
        const detailRes = await fetch(`/api/forum/threads/${foundThread.id}`)
        const detail = await detailRes.json()
        setThread(detail)
      }
    } catch (error) {
      console.error('Error fetching thread:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim() || !thread) return

    setSubmitting(true)
    try {
      await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: thread.id,
          content: replyContent,
        }),
      })

      setReplyContent('')
      fetchThread()
    } catch (error) {
      console.error('Error posting reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      await fetch('/api/forum/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reactionType }),
      })
      fetchThread()
    } catch (error) {
      console.error('Error reacting:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <p>Thread not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm">
          <Link href="/community" className="text-purple-600 hover:underline">
            Community
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/community/${categorySlug}`}
            className="text-purple-600 hover:underline"
          >
            {thread.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{thread.title}</span>
        </div>

        {/* Thread Title */}
        <h1 className="text-3xl font-bold mb-6">{thread.title}</h1>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <div className="flex gap-2 mb-6">
            {thread.tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {thread.posts.map((post: any, index: number) => (
            <Card key={post.id} className="p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {post.user.profilePhotoUrl ? (
                    <img
                      src={post.user.profilePhotoUrl}
                      alt={post.user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {getInitials(post.user.name || post.user.username)}
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {post.user.name || post.user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(new Date(post.createdAt))}
                        {post.editedAt && ' (edited)'}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Original Post
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className="prose prose-sm max-w-none mb-4"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Reactions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {Object.entries(REACTION_TYPES).map(([key, reaction]) => {
                      const Icon = REACTION_ICONS[key]
                      const count = post.reactions.filter(
                        (r: any) => r.reactionType === key
                      ).length

                      return (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => handleReaction(post.id, key)}
                          className="text-xs"
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {reaction.emoji} {count > 0 && count}
                        </Button>
                      )
                    })}

                    <Button variant="ghost" size="sm" className="ml-auto">
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="w-3 h-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        {!thread.isLocked ? (
          <Card className="p-6">
            <h3 className="font-bold mb-4">Post a Reply</h3>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows={6}
              className="mb-4"
            />
            <Button
              onClick={handleReply}
              disabled={submitting || !replyContent.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              {submitting ? 'Posting...' : 'Post Reply'}
            </Button>
          </Card>
        ) : (
          <Card className="p-6 text-center bg-gray-50">
            <p className="text-gray-600">This thread is locked and no longer accepts replies.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
