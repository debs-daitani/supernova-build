'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, GripVertical, ExternalLink, Eye, Copy, CheckCircle } from 'lucide-react'

interface BioLink {
  id: string
  title: string
  url: string
  icon?: string
}

interface LinkInBio {
  id: string
  username: string
  title: string | null
  bio: string | null
  avatarUrl: string | null
  links: BioLink[]
  theme: string
}

const THEMES = [
  { id: 'default', name: 'Default', bg: 'bg-gray-900', text: 'text-white' },
  { id: 'neon', name: 'Neon', bg: 'bg-black', text: 'text-light-teal' },
  { id: 'gradient', name: 'Gradient', bg: 'bg-gradient-to-br from-purple-900 to-pink-900', text: 'text-white' },
  { id: 'minimal', name: 'Minimal', bg: 'bg-white', text: 'text-gray-900' },
]

export default function LinkInBioPage() {
  const [bio, setBio] = useState<LinkInBio | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchBio()
  }, [])

  const fetchBio = async () => {
    try {
      const response = await fetch('/api/marketing/bio')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setBio(data)
        } else {
          // Initialize empty bio
          setBio({
            id: '',
            username: '',
            title: '',
            bio: '',
            avatarUrl: '',
            links: [],
            theme: 'default',
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch bio:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveBio = async () => {
    if (!bio || !bio.username) {
      alert('Please enter a username')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/marketing/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: bio.username,
          title: bio.title,
          bio: bio.bio,
          avatarUrl: bio.avatarUrl,
          links: bio.links,
          theme: bio.theme,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBio(data)
        alert('Saved successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save')
      }
    } catch (error) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addLink = () => {
    if (!bio) return
    setBio({
      ...bio,
      links: [
        ...bio.links,
        { id: Date.now().toString(), title: '', url: '' },
      ],
    })
  }

  const updateLink = (id: string, updates: Partial<BioLink>) => {
    if (!bio) return
    setBio({
      ...bio,
      links: bio.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })
  }

  const removeLink = (id: string) => {
    if (!bio) return
    setBio({
      ...bio,
      links: bio.links.filter((l) => l.id !== id),
    })
  }

  const copyLink = () => {
    if (!bio?.username) return
    const url = `${window.location.origin}/bio/${bio.username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  if (!bio) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-josefin">Failed to load</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Link-in-Bio</h2>
          <p className="text-sm text-gray-400 font-josefin">
            Create your personalized link page
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bio.id && bio.username && (
            <>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all"
              >
                {copied ? (
                  <>
                    <CheckCircle size={18} className="text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Link
                  </>
                )}
              </button>
              <a
                href={`/bio/${bio.username}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-josefin hover:bg-purple-500/30 transition-all"
              >
                <Eye size={18} />
                Preview
              </a>
            </>
          )}
          <button
            onClick={saveBio}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          {/* Profile */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
            <h3 className="font-supernova text-white">Profile</h3>

            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Username *</label>
              <div className="flex items-center">
                <span className="text-gray-500 font-josefin text-sm mr-2">daitaniverse.space/bio/</span>
                <input
                  type="text"
                  value={bio.username}
                  onChange={(e) => setBio({ ...bio, username: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                  placeholder="yourname"
                  className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={bio.title || ''}
                onChange={(e) => setBio({ ...bio, title: e.target.value })}
                placeholder="Your Name"
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Bio</label>
              <textarea
                value={bio.bio || ''}
                onChange={(e) => setBio({ ...bio, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Avatar URL</label>
              <input
                type="url"
                value={bio.avatarUrl || ''}
                onChange={(e) => setBio({ ...bio, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Theme */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
            <h3 className="font-supernova text-white">Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setBio({ ...bio, theme: theme.id })}
                  className={`p-4 rounded-xl border transition-all ${
                    bio.theme === theme.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-light-teal/20 hover:border-purple-500/50'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg ${theme.bg} mb-2`} />
                  <span className="font-josefin text-sm text-gray-300">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
            <h3 className="font-supernova text-white">Links</h3>

            {bio.links.map((link, index) => (
              <div
                key={link.id}
                className="p-4 rounded-xl bg-black/30 border border-light-teal/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-500 cursor-grab" />
                    <span className="text-xs font-josefin text-purple-400">Link {index + 1}</span>
                  </div>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-josefin text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateLink(link.id, { title: e.target.value })}
                    placeholder="Link title"
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-josefin text-gray-400 mb-1">URL</label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-gray-300 font-josefin hover:bg-white/20 transition-all w-full justify-center"
            >
              <Plus size={18} />
              Add Link
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="sticky top-6">
          <h4 className="font-supernova text-gray-400 mb-2 text-sm">Preview</h4>
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 overflow-hidden">
            <div
              className={`min-h-[500px] p-8 ${
                THEMES.find((t) => t.id === bio.theme)?.bg || 'bg-gray-900'
              }`}
            >
              <div className="max-w-sm mx-auto text-center">
                {/* Avatar */}
                {bio.avatarUrl ? (
                  <img
                    src={bio.avatarUrl}
                    alt={bio.title || ''}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-white/20 flex items-center justify-center">
                    <span className="text-3xl text-white/50">
                      {bio.title?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}

                {/* Name */}
                <h2
                  className={`text-xl font-supernova mb-2 ${
                    THEMES.find((t) => t.id === bio.theme)?.text || 'text-white'
                  }`}
                >
                  {bio.title || 'Your Name'}
                </h2>

                {/* Bio */}
                {bio.bio && (
                  <p
                    className={`text-sm font-josefin mb-6 opacity-80 ${
                      THEMES.find((t) => t.id === bio.theme)?.text || 'text-white'
                    }`}
                  >
                    {bio.bio}
                  </p>
                )}

                {/* Links */}
                <div className="space-y-3">
                  {bio.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-josefin transition-all ${
                        bio.theme === 'minimal'
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {link.title || 'Untitled Link'}
                      <ExternalLink size={14} />
                    </a>
                  ))}
                </div>

                {bio.links.length === 0 && (
                  <p className="text-sm font-josefin text-white/50">No links yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
