'use client'

import { useState, useEffect } from 'react'
import { Plus, Link2, Copy, CheckCircle, Trash2, BarChart2, ExternalLink, Edit } from 'lucide-react'

interface ShortLink {
  id: string
  slug: string
  destinationUrl: string
  clicks: number
  createdAt: string
}

export default function LinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editSlug, setEditSlug] = useState('')

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/marketing/links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
    } finally {
      setLoading(false)
    }
  }

  const createLink = async () => {
    if (!newUrl) return

    setCreating(true)
    try {
      const response = await fetch('/api/marketing/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationUrl: newUrl,
          slug: newSlug || undefined,
        }),
      })

      if (response.ok) {
        const link = await response.json()
        setLinks([link, ...links])
        setNewUrl('')
        setNewSlug('')
        setShowCreate(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create link')
      }
    } catch (error) {
      alert('Failed to create link')
    } finally {
      setCreating(false)
    }
  }

  const updateLink = async (id: string) => {
    try {
      const response = await fetch(`/api/marketing/links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: editSlug }),
      })

      if (response.ok) {
        setLinks(links.map((l) => (l.id === id ? { ...l, slug: editSlug } : l)))
        setEditing(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update link')
      }
    } catch (error) {
      alert('Failed to update link')
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const response = await fetch(`/api/marketing/links/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setLinks(links.filter((l) => l.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete link:', error)
    }
  }

  const copyLink = (link: ShortLink) => {
    const shortUrl = `https://daitaniverse.space/l/${link.slug}`
    navigator.clipboard.writeText(shortUrl)
    setCopied(link.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const startEditing = (link: ShortLink) => {
    setEditing(link.id)
    setEditSlug(link.slug)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading links...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Short Links</h2>
          <p className="text-sm text-gray-400 font-josefin">
            Create trackable short links for your campaigns
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
        >
          <Plus size={20} />
          Create Link
        </button>
      </div>

      {/* Create Link Modal */}
      {showCreate && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
          <h3 className="font-supernova text-white">Create Short Link</h3>
          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">Destination URL *</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com/your-long-url"
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">Custom Slug (optional)</label>
            <div className="flex items-center">
              <span className="text-gray-500 font-josefin text-sm mr-2">daitaniverse.space/l/</span>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="auto-generated"
                className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createLink}
              disabled={creating || !newUrl}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Link'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 font-josefin hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      {links.length === 0 && !showCreate ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Link2 className="text-purple-400" size={32} />
          </div>
          <h3 className="text-xl font-supernova text-white mb-2">No Links Yet</h3>
          <p className="text-gray-400 font-josefin mb-4">
            Create your first short link to start tracking clicks
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-josefin hover:bg-purple-500/30 transition-all"
          >
            <Plus size={18} />
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">Short Link</th>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">Destination</th>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">Clicks</th>
                <th className="px-4 py-3 text-left text-xs font-josefin text-gray-400 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-josefin text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-teal/10">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    {editing === link.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-josefin text-sm">daitaniverse.space/l/</span>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="px-2 py-1 rounded bg-black/50 border border-light-teal/20 text-white font-josefin text-sm focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => updateLink(link.id)}
                          className="text-green-400 text-sm font-josefin"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-gray-400 text-sm font-josefin"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyLink(link)}
                          className="font-josefin text-purple-400 hover:text-purple-300 transition-colors text-left"
                          title="Click to copy full URL"
                        >
                          daitaniverse.space/l/{link.slug}
                        </button>
                        <button
                          onClick={() => startEditing(link)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Edit slug"
                        >
                          <Edit size={12} />
                        </button>
                        {copied === link.id && (
                          <span className="text-green-400 text-xs font-josefin">Copied!</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={link.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-josefin text-gray-300 hover:text-white transition-colors max-w-xs truncate"
                    >
                      {link.destinationUrl}
                      <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm font-josefin text-gray-300">
                      <BarChart2 size={14} />
                      {link.clicks}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-josefin text-gray-400">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyLink(link)}
                        className="p-1.5 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                      >
                        {copied === link.id ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
