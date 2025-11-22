'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Edit, Trash2, Home, Eye, Settings, Globe, FileText } from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  isHomepage: boolean
  isPublished: boolean
  order: number
}

interface Website {
  id: string
  name: string
  subdomain: string
  isPublished: boolean
}

export default function PagesManagerPage() {
  const params = useParams()
  const router = useRouter()
  const websiteId = params.id as string

  const [website, setWebsite] = useState<Website | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWebsite()
    fetchPages()
  }, [websiteId])

  const fetchWebsite = async () => {
    try {
      const response = await fetch(`/api/websites/${websiteId}`)
      const data = await response.json()
      setWebsite(data)
    } catch (error) {
      console.error('Error fetching website:', error)
    }
  }

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/pages?websiteId=${websiteId}`)
      const data = await response.json()
      setPages(data)
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = async () => {
    const title = prompt('Enter page title:')
    if (!title) return

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, title }),
      })

      if (response.ok) {
        const newPage = await response.json()
        setPages([...pages, newPage])
      }
    } catch (error) {
      console.error('Error creating page:', error)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      await fetch(`/api/pages/${pageId}`, { method: 'DELETE' })
      setPages(pages.filter(p => p.id !== pageId))
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const handleSetHomepage = async (pageId: string) => {
    try {
      await fetch(`/api/pages/${pageId}/set-homepage`, { method: 'POST' })
      fetchPages()
    } catch (error) {
      console.error('Error setting homepage:', error)
    }
  }

  const handlePublish = async () => {
    if (!confirm('Publish this website? It will be live at ' + website?.subdomain)) return

    try {
      await fetch(`/api/websites/${websiteId}/publish`, { method: 'POST' })
      fetchWebsite()
      alert('Website published successfully!')
    } catch (error) {
      console.error('Error publishing website:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/websites" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            ← Back to Websites
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{website?.name}</h1>
              <p className="text-sm text-gray-600">{website?.subdomain}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/websites/${websiteId}/settings`}>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Link href={`/websites/${websiteId}/preview`}>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </Link>
              <Link href={`/websites/${websiteId}/submissions`}>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Form Submissions
                </Button>
              </Link>
              <Button
                className="gap-2"
                onClick={handlePublish}
                disabled={website?.isPublished}
              >
                <Globe className="h-4 w-4" />
                {website?.isPublished ? 'Published' : 'Publish'}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button className="px-4 py-2 border-b-2 border-pink-500 font-medium">
              Pages
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Pages</h2>
          <Button onClick={handleCreatePage} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Page
          </Button>
        </div>

        {pages.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">No pages yet</p>
            <Button onClick={handleCreatePage}>Create First Page</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <Card key={page.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      {page.isHomepage ? (
                        <Home className="h-6 w-6 text-pink-600" />
                      ) : (
                        <FileText className="h-6 w-6 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{page.title}</h3>
                        {page.isHomepage && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                            Homepage
                          </span>
                        )}
                        {page.isPublished && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Published
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">/{page.slug}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/websites/${websiteId}/pages/${page.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    {!page.isHomepage && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetHomepage(page.id)}
                        >
                          Set as Homepage
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
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
