'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Globe, Settings, Trash2, Copy, Eye, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Website {
  id: string
  name: string
  domain: string
  subdomain: string
  isPublished: boolean
  updatedAt: string
  pages: Array<{ id: string; title: string }>
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all')

  useEffect(() => {
    fetchWebsites()
  }, [])

  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites')
      const data = await response.json()
      setWebsites(data)
    } catch (error) {
      console.error('Error fetching websites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return

    try {
      await fetch(`/api/websites/${id}`, { method: 'DELETE' })
      setWebsites(websites.filter(w => w.id !== id))
    } catch (error) {
      console.error('Error deleting website:', error)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/websites/${id}/duplicate`, { method: 'POST' })
      const newWebsite = await response.json()
      setWebsites([newWebsite, ...websites])
    } catch (error) {
      console.error('Error duplicating website:', error)
    }
  }

  const filteredWebsites = websites.filter(w => {
    if (filter === 'published') return w.isPublished
    if (filter === 'drafts') return !w.isPublished
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-pink-purple flex items-center justify-center">
                  <span className="text-white font-bold">dA</span>
                </div>
                <span className="text-lg font-bold">dAItaniverse</span>
              </Link>
              <h1 className="text-3xl font-bold">My Websites</h1>
            </div>
            <Link href="/websites/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Website
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All ({websites.length})
            </Button>
            <Button
              variant={filter === 'published' ? 'default' : 'outline'}
              onClick={() => setFilter('published')}
              size="sm"
            >
              Published ({websites.filter(w => w.isPublished).length})
            </Button>
            <Button
              variant={filter === 'drafts' ? 'default' : 'outline'}
              onClick={() => setFilter('drafts')}
              size="sm"
            >
              Drafts ({websites.filter(w => !w.isPublished).length})
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {filteredWebsites.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No websites yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first website to get started
            </p>
            <Link href="/websites/new">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Website
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebsites.map((website) => (
              <Card key={website.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{website.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {website.subdomain}
                      </CardDescription>
                    </div>
                    {website.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                    <Globe className="h-12 w-12 text-pink-400" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{website.pages.length} page{website.pages.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs mt-1">Updated {formatDate(website.updatedAt)}</p>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Link href={`/websites/${website.id}/pages`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Settings className="h-4 w-4" />
                      Manage
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(website.id)}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {website.isPublished && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://${website.subdomain}`, '_blank')}
                      title="View Live"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(website.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
