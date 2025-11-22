'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, Bookmark, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatTimeAgo } from '@/lib/forum-utils'

export default function MyActivityPage() {
  const userId = 'user_placeholder' // TODO: Get from auth
  const [tab, setTab] = useState<'threads' | 'posts' | 'subscriptions'>('threads')
  const [threads, setThreads] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tab === 'threads') {
      fetchThreads()
    } else if (tab === 'subscriptions') {
      fetchSubscriptions()
    }
  }, [tab])

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/forum/threads?userId=${userId}`)
      const data = await res.json()
      setThreads(data.threads || [])
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/forum/subscriptions')
      const data = await res.json()
      setSubscriptions(data)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-8">
          My Activity
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={tab === 'threads' ? 'default' : 'outline'}
            onClick={() => setTab('threads')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            My Threads
          </Button>
          <Button
            variant={tab === 'posts' ? 'default' : 'outline'}
            onClick={() => setTab('posts')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            My Posts
          </Button>
          <Button
            variant={tab === 'subscriptions' ? 'default' : 'outline'}
            onClick={() => setTab('subscriptions')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Subscriptions
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <>
            {/* My Threads */}
            {tab === 'threads' && (
              <div className="space-y-4">
                {threads.length === 0 ? (
                  <Card className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't created any threads yet</p>
                    <Link href="/community/new">
                      <Button>Create Your First Thread</Button>
                    </Link>
                  </Card>
                ) : (
                  threads.map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/community/${thread.category.slug}/${thread.slug}`}
                    >
                      <Card className="p-6 hover:shadow-xl transition-shadow">
                        <h3 className="font-bold text-lg mb-2">{thread.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{thread.category.name}</span>
                          <span>•</span>
                          <span>{thread.replyCount} replies</span>
                          <span>•</span>
                          <span>{thread.viewCount} views</span>
                          <span>•</span>
                          <span>{formatTimeAgo(new Date(thread.createdAt))}</span>
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Subscriptions */}
            {tab === 'subscriptions' && (
              <div className="space-y-4">
                {subscriptions.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No subscriptions yet</p>
                  </Card>
                ) : (
                  subscriptions.map((sub) => (
                    <Card key={sub.id} className="p-6">
                      {sub.thread && (
                        <Link href={`/community/${sub.thread.category.slug}/${sub.thread.slug}`}>
                          <div>
                            <h3 className="font-bold mb-1">{sub.thread.title}</h3>
                            <p className="text-sm text-gray-600">{sub.thread.category.name}</p>
                          </div>
                        </Link>
                      )}
                      {sub.category && (
                        <Link href={`/community/${sub.category.slug}`}>
                          <div>
                            <h3 className="font-bold mb-1">{sub.category.name}</h3>
                            <p className="text-sm text-gray-600">Category subscription</p>
                          </div>
                        </Link>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
