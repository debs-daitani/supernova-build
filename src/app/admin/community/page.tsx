'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle, XCircle, Eye, Trash2, Lock, Pin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatTimeAgo } from '@/lib/forum-utils'

export default function ModerationDashboardPage() {
  const [reports, setReports] = useState<any[]>([])
  const [threads, setThreads] = useState<any[]>([])
  const [tab, setTab] = useState<'reports' | 'threads'>('reports')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tab === 'reports') {
      fetchReports()
    } else {
      fetchThreads()
    }
  }, [tab])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/forum/reports?status=PENDING')
      const data = await res.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/forum/threads?limit=50')
      const data = await res.json()
      setThreads(data.threads || [])
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePinThread = async (threadId: string, isPinned: boolean) => {
    try {
      await fetch(`/api/forum/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      })
      fetchThreads()
    } catch (error) {
      console.error('Error pinning thread:', error)
    }
  }

  const handleLockThread = async (threadId: string, isLocked: boolean) => {
    try {
      await fetch(`/api/forum/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !isLocked }),
      })
      fetchThreads()
    } catch (error) {
      console.error('Error locking thread:', error)
    }
  }

  const handleFeatureThread = async (threadId: string, isFeatured: boolean) => {
    try {
      await fetch(`/api/forum/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      })
      fetchThreads()
    } catch (error) {
      console.error('Error featuring thread:', error)
    }
  }

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Are you sure you want to delete this thread?')) return

    try {
      await fetch(`/api/forum/threads/${threadId}`, {
        method: 'DELETE',
      })
      fetchThreads()
    } catch (error) {
      console.error('Error deleting thread:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-8">
          Community Moderation
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={tab === 'reports' ? 'default' : 'outline'}
            onClick={() => setTab('reports')}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Reports ({reports.length})
          </Button>
          <Button
            variant={tab === 'threads' ? 'default' : 'outline'}
            onClick={() => setTab('threads')}
          >
            <Eye className="w-4 h-4 mr-2" />
            All Threads
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Reports Tab */}
            {tab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <Card className="p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No pending reports</p>
                  </Card>
                ) : (
                  reports.map((report) => (
                    <Card key={report.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold mb-1">
                                {report.reason.replace(/_/g, ' ')}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                Reported by {report.reportedBy.name || report.reportedBy.username}
                                {' • '}
                                {formatTimeAgo(new Date(report.createdAt))}
                              </p>
                            </div>
                          </div>

                          {report.details && (
                            <p className="text-sm text-gray-700 mb-3">"{report.details}"</p>
                          )}

                          <Link
                            href={`/community/${report.post.thread.slug}`}
                            className="text-sm text-purple-600 hover:underline mb-3 block"
                          >
                            View thread: {report.post.thread.title}
                          </Link>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View Post
                            </Button>
                            <Button size="sm" variant="outline">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Dismiss
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Delete Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Threads Tab */}
            {tab === 'threads' && (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <Card key={thread.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {thread.isPinned && (
                            <Pin className="w-4 h-4 text-purple-500" />
                          )}
                          {thread.isLocked && (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
                          {thread.isFeatured && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                          <Link
                            href={`/community/${thread.category.slug}/${thread.slug}`}
                            className="font-bold text-lg hover:text-purple-600"
                          >
                            {thread.title}
                          </Link>
                        </div>

                        <p className="text-sm text-gray-600">
                          by {thread.user.name || thread.user.username} in {thread.category.name}
                          {' • '}
                          {thread.replyCount} replies
                          {' • '}
                          {thread.viewCount} views
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={thread.isPinned ? 'default' : 'outline'}
                          onClick={() => handlePinThread(thread.id, thread.isPinned)}
                          title="Pin thread"
                        >
                          <Pin className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={thread.isLocked ? 'default' : 'outline'}
                          onClick={() => handleLockThread(thread.id, thread.isLocked)}
                          title="Lock thread"
                        >
                          <Lock className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={thread.isFeatured ? 'default' : 'outline'}
                          onClick={() => handleFeatureThread(thread.id, thread.isFeatured)}
                          title="Feature thread"
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeleteThread(thread.id)}
                          title="Delete thread"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
