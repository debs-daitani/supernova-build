'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Eye, MousePointer, Edit2, Trash2, ExternalLink, Copy } from 'lucide-react'

interface LandingPage {
  id: string
  title: string
  slug: string
  template?: string
  status: string
  views: number
  conversions: number
  publishedAt?: string
  createdAt: string
  _count: {
    leadMagnets: number
  }
}

export default function LandingPagesPage() {
  const [pages, setPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchPages()
  }, [filter])

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/marketing/pages?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setPages(data)
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const response = await fetch(`/api/marketing/pages/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setPages(pages.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }

  const getConversionRate = (page: LandingPage) => {
    if (page.views === 0) return '0%'
    return ((page.conversions / page.views) * 100).toFixed(1) + '%'
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
          <h2 className="text-2xl font-supernova text-light-teal">Landing Pages</h2>
          <p className="text-sm text-gray-400 font-josefin">Create high-converting landing pages</p>
        </div>
        <Link
          href="/marketing/pages/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
        >
          <Plus size={18} />
          New Page
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'draft', 'published'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-josefin text-sm capitalize transition-all ${
              filter === status
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Pages Grid */}
      {pages.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-supernova text-white mb-2">No Landing Pages Yet</h3>
          <p className="text-gray-400 font-josefin mb-4">
            Create your first landing page to start capturing leads
          </p>
          <Link
            href="/marketing/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin"
          >
            <Plus size={18} />
            Create Your First Page
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden hover:border-purple-500/50 transition-all"
            >
              {/* Preview */}
              <div className="h-32 bg-gradient-to-br from-purple-900/30 to-hot-pink/20 flex items-center justify-center">
                <span className="text-2xl font-supernova text-white/30">{page.title.charAt(0)}</span>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-supernova text-white">{page.title}</h3>
                    <p className="text-xs text-gray-500 font-josefin">/p/{page.slug}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-josefin ${
                      page.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {page.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded bg-white/5">
                    <Eye size={14} className="mx-auto text-gray-400 mb-1" />
                    <div className="text-sm font-josefin text-white">{page.views}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center p-2 rounded bg-white/5">
                    <MousePointer size={14} className="mx-auto text-gray-400 mb-1" />
                    <div className="text-sm font-josefin text-white">{page.conversions}</div>
                    <div className="text-xs text-gray-500">Converts</div>
                  </div>
                  <div className="text-center p-2 rounded bg-white/5">
                    <div className="text-sm font-josefin text-green-400">{getConversionRate(page)}</div>
                    <div className="text-xs text-gray-500">Rate</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/marketing/pages/${page.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/10 text-white font-josefin text-sm hover:bg-white/20 transition-all"
                  >
                    <Edit2 size={14} />
                    Edit
                  </Link>
                  {page.status === 'published' && (
                    <>
                      <button
                        onClick={() => copyLink(page.slug)}
                        className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-all"
                        title="Copy link"
                      >
                        <Copy size={14} />
                      </button>
                      <Link
                        href={`/p/${page.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-all"
                        title="View page"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => deletePage(page.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
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

function FileText(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
