'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { MessageSquare, Eye, Pin, Lock, Star, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatTimeAgo } from '@/lib/forum-utils'

interface Thread {
  id: string
  title: string
  slug: string
  isPinned: boolean
  isLocked: boolean
  isFeatured: boolean
  viewCount: number
  replyCount: number
  lastActivityAt: string
  tags: string[]
  user: any
  category: any
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = use(params)
  const [threads, setThreads] = useState<Thread[]>([])
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    fetchCategory()
    fetchThreads()
  }, [categorySlug, sort])

  const fetchCategory = async () => {
    try {
      const res = await fetch('/api/forum/categories')
      const categories = await res.json()
      const cat = categories.find((c: any) => c.slug === categorySlug)
      setCategory(cat)
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  }

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/forum/threads?categoryId=${category?.id}&sort=${sort}`
      )
      const data = await res.json()
      setThreads(data.threads || [])
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!category && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <p>Category not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm">
          <Link href="/community" className="text-purple-600 hover:underline">
            Community
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{category?.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
              {category?.name}
            </h1>
            <p className="text-gray-600">{category?.description}</p>
          </div>

          <Link href="/community/new">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Thread
            </Button>
          </Link>
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={sort === 'recent' ? 'default' : 'outline'}
            onClick={() => setSort('recent')}
            size="sm"
          >
            Recent
          </Button>
          <Button
            variant={sort === 'popular' ? 'default' : 'outline'}
            onClick={() => setSort('popular')}
            size="sm"
          >
            Popular
          </Button>
          <Button
            variant={sort === 'replies' ? 'default' : 'outline'}
            onClick={() => setSort('replies')}
            size="sm"
          >
            Most Replies
          </Button>
        </div>

        {/* Threads */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : threads.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No threads yet. Be the first to start a conversation!</p>
            <Link href="/community/new">
              <Button>Create Thread</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link key={thread.id} href={`/community/${categorySlug}/${thread.slug}`}>
                <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Thread Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {thread.isPinned && <Pin className="w-4 h-4 text-purple-500" />}
                        {thread.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                        {thread.isFeatured && <Star className="w-4 h-4 text-yellow-500" />}
                        <h3 className="font-bold text-lg">{thread.title}</h3>
                      </div>

                      {/* Tags */}
                      {thread.tags.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {thread.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{thread.user.name || thread.user.username}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(new Date(thread.lastActivityAt))}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageSquare className="w-4 h-4" />
                          <span>{thread.replyCount}</span>
                        </div>
                        <span className="text-xs text-gray-500">replies</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span>{thread.viewCount}</span>
                        </div>
                        <span className="text-xs text-gray-500">views</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
