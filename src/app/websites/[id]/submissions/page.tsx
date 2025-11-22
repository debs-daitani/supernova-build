'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Mail, Phone, Calendar, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface FormSubmission {
  id: string
  formName: string
  name: string | null
  email: string | null
  phone: string | null
  message: string | null
  data: any
  isRead: boolean
  createdAt: string
}

export default function FormSubmissionsPage() {
  const params = useParams()
  const websiteId = params.id as string

  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    fetchSubmissions()
  }, [websiteId])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/form-submissions?websiteId=${websiteId}`)
      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      await fetch(`/api/form-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead }),
      })
      fetchSubmissions()
    } catch (error) {
      console.error('Error updating submission:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return

    try {
      await fetch(`/api/form-submissions/${id}`, { method: 'DELETE' })
      setSubmissions(submissions.filter((s) => s.id !== id))
    } catch (error) {
      console.error('Error deleting submission:', error)
    }
  }

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === 'unread') return !s.isRead
    if (filter === 'read') return s.isRead
    return true
  })

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/websites/${websiteId}/pages`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pages
          </Link>
          <h1 className="text-3xl font-bold">Form Submissions</h1>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All ({submissions.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              size="sm"
            >
              Unread ({submissions.filter((s) => !s.isRead).length})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              onClick={() => setFilter('read')}
              size="sm"
            >
              Read ({submissions.filter((s) => s.isRead).length})
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {filteredSubmissions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-2">No form submissions yet</p>
            <p className="text-sm text-gray-500">
              When visitors submit forms on your website, they will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card
                key={submission.id}
                className={`p-6 ${!submission.isRead ? 'border-l-4 border-l-pink-500 bg-pink-50/30' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-lg">{submission.name || 'Anonymous'}</h3>
                      {!submission.isRead && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                          New
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {submission.formName}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {submission.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${submission.email}`}
                            className="hover:text-pink-600"
                          >
                            {submission.email}
                          </a>
                        </div>
                      )}
                      {submission.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${submission.phone}`} className="hover:text-pink-600">
                            {submission.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(submission.createdAt)}
                      </div>
                    </div>

                    {submission.message && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {submission.message}
                        </p>
                      </div>
                    )}

                    {/* Additional Data */}
                    {submission.data && Object.keys(submission.data).length > 0 && (
                      <details className="mt-4">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                          View all data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                          {JSON.stringify(submission.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(submission.id, !submission.isRead)}
                    >
                      {submission.isRead ? 'Mark Unread' : 'Mark Read'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(submission.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
