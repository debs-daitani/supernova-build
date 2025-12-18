'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Settings, Type, Image, List, MousePointer } from 'lucide-react'

interface LandingPage {
  id: string
  title: string
  slug: string
  template?: string
  content: any
  settings?: any
  status: string
}

interface Block {
  type: string
  data: any
}

export default function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [page, setPage] = useState<LandingPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content')

  useEffect(() => {
    fetchPage()
  }, [id])

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/marketing/pages/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPage(data)
      }
    } catch (error) {
      console.error('Failed to fetch page:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePage = async () => {
    if (!page) return

    setSaving(true)
    try {
      const response = await fetch(`/api/marketing/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          content: page.content,
          settings: page.settings,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to save')
      }
    } catch (error) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const publishPage = async () => {
    if (!page) return

    setSaving(true)
    try {
      const response = await fetch(`/api/marketing/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      })

      if (response.ok) {
        setPage({ ...page, status: 'published' })
        alert('Page published!')
      }
    } catch (error) {
      alert('Failed to publish')
    } finally {
      setSaving(false)
    }
  }

  const updateBlock = (index: number, data: any) => {
    if (!page) return
    const blocks = [...(page.content.blocks || [])]
    blocks[index] = { ...blocks[index], data: { ...blocks[index].data, ...data } }
    setPage({ ...page, content: { ...page.content, blocks } })
  }

  const addBlock = (type: string) => {
    if (!page) return
    const blocks = [...(page.content.blocks || [])]
    blocks.push({ type, data: getDefaultBlockData(type) })
    setPage({ ...page, content: { ...page.content, blocks } })
  }

  const removeBlock = (index: number) => {
    if (!page) return
    const blocks = [...(page.content.blocks || [])]
    blocks.splice(index, 1)
    setPage({ ...page, content: { ...page.content, blocks } })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading...</div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-josefin">Page not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/marketing/pages')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-light-teal" size={24} />
          </button>
          <div>
            <input
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="text-2xl font-supernova text-light-teal bg-transparent border-none focus:outline-none"
            />
            <p className="text-sm text-gray-400 font-josefin">/p/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={savePage}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            Save
          </button>
          {page.status === 'draft' ? (
            <button
              onClick={publishPage}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-josefin hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50"
            >
              Publish
            </button>
          ) : (
            <a
              href={`/p/${page.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-josefin hover:bg-purple-500/30 transition-all"
            >
              <Eye size={18} />
              View
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-lg font-josefin transition-all ${
            activeTab === 'content'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-josefin transition-all ${
            activeTab === 'settings'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Settings size={16} className="inline mr-1" />
          Settings
        </button>
      </div>

      {activeTab === 'content' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Block Editor */}
          <div className="lg:col-span-3 space-y-4">
            {(page.content.blocks || []).map((block: Block, index: number) => (
              <BlockEditor
                key={index}
                block={block}
                onChange={(data) => updateBlock(index, data)}
                onRemove={() => removeBlock(index)}
              />
            ))}

            {/* Add Block */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-dashed border-light-teal/20 p-6">
              <p className="text-gray-400 font-josefin text-sm mb-3">Add a block:</p>
              <div className="flex flex-wrap gap-2">
                {['hero', 'text', 'form', 'features', 'cta', 'image'].map((type) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 font-josefin text-sm hover:bg-white/20 transition-all capitalize"
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <h4 className="font-supernova text-gray-400 mb-2 text-sm">Preview</h4>
              <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-light-teal/20 p-4 aspect-[9/16] overflow-hidden">
                <div className="transform scale-50 origin-top-left w-[200%]">
                  <PagePreview content={page.content} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Settings */
        <div className="max-w-xl backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
          <h3 className="font-supernova text-white">Page Settings</h3>

          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">URL Slug</label>
            <input
              type="text"
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">SEO Title</label>
            <input
              type="text"
              value={page.settings?.seoTitle || ''}
              onChange={(e) => setPage({ ...page, settings: { ...page.settings, seoTitle: e.target.value } })}
              placeholder={page.title}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-josefin text-gray-300 mb-1">SEO Description</label>
            <textarea
              value={page.settings?.seoDescription || ''}
              onChange={(e) => setPage({ ...page, settings: { ...page.settings, seoDescription: e.target.value } })}
              rows={3}
              placeholder="Describe your page for search engines..."
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function BlockEditor({ block, onChange, onRemove }: { block: Block; onChange: (data: any) => void; onRemove: () => void }) {
  const renderEditor = () => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={block.data.headline || ''}
              onChange={(e) => onChange({ headline: e.target.value })}
              placeholder="Headline"
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-supernova text-lg focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              value={block.data.subheadline || ''}
              onChange={(e) => onChange({ subheadline: e.target.value })}
              placeholder="Subheadline"
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>
        )
      case 'text':
        return (
          <textarea
            value={block.data.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Enter your text..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
          />
        )
      case 'form':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={block.data.buttonText || ''}
              onChange={(e) => onChange({ buttonText: e.target.value })}
              placeholder="Button text"
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-500">Fields: email, name (auto-generated)</p>
          </div>
        )
      case 'cta':
        return (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={block.data.buttonText || ''}
              onChange={(e) => onChange({ buttonText: e.target.value })}
              placeholder="Button text"
              className="px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              value={block.data.buttonUrl || ''}
              onChange={(e) => onChange({ buttonUrl: e.target.value })}
              placeholder="Button URL"
              className="px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
          </div>
        )
      case 'features':
        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-josefin">Add feature items (one per line):</p>
            <textarea
              value={(block.data.items || []).join('\n')}
              onChange={(e) => onChange({ items: e.target.value.split('\n').filter((item: string) => item.trim()) })}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-500">{(block.data.items || []).length} features added</p>
          </div>
        )
      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-josefin text-gray-400 mb-1">Image URL</label>
              <input
                type="url"
                value={block.data.url || ''}
                onChange={(e) => onChange({ url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-josefin text-gray-400 mb-1">Alt Text</label>
              <input
                type="text"
                value={block.data.alt || ''}
                onChange={(e) => onChange({ alt: e.target.value })}
                placeholder="Describe the image"
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
            {block.data.url && (
              <div className="mt-2">
                <img src={block.data.url} alt={block.data.alt || ''} className="max-h-32 rounded-lg" />
              </div>
            )}
          </div>
        )
      default:
        return <p className="text-gray-500 text-sm">Block type: {block.type}</p>
    }
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-josefin text-purple-400 uppercase">{block.type}</span>
        <button
          onClick={onRemove}
          className="text-red-400 text-xs hover:text-red-300"
        >
          Remove
        </button>
      </div>
      {renderEditor()}
    </div>
  )
}

function PagePreview({ content }: { content: any }) {
  return (
    <div className="bg-gray-900 p-4 min-h-full">
      {(content.blocks || []).map((block: Block, index: number) => (
        <div key={index} className="mb-4">
          {block.type === 'hero' && (
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold text-white mb-2">{block.data.headline}</h1>
              <p className="text-gray-400">{block.data.subheadline}</p>
            </div>
          )}
          {block.type === 'form' && (
            <div className="max-w-xs mx-auto">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 rounded bg-gray-800 text-white text-sm mb-2"
                disabled
              />
              <button className="w-full px-3 py-2 rounded bg-purple-500 text-white text-sm">
                {block.data.buttonText || 'Submit'}
              </button>
            </div>
          )}
          {block.type === 'text' && (
            <p className="text-gray-300 text-sm">{block.data.content}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function getDefaultBlockData(type: string) {
  const defaults: Record<string, any> = {
    hero: { headline: 'Your Headline', subheadline: 'Your subheadline goes here' },
    text: { content: '' },
    form: { fields: ['email'], buttonText: 'Submit' },
    features: { items: [] },
    cta: { buttonText: 'Get Started', buttonUrl: '' },
    image: { url: '', alt: '' },
  }
  return defaults[type] || {}
}
