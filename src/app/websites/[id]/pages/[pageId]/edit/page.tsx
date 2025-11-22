'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Eye, Plus, Trash2, Edit, Monitor, Tablet, Smartphone } from 'lucide-react'
import { sections, getSectionsByCategory } from '@/lib/sections'

interface Page {
  id: string
  title: string
  slug: string
  content: any[]
  seoTitle?: string
  seoDescription?: string
}

export default function PageEditorPage() {
  const params = useParams()
  const router = useRouter()
  const websiteId = params.id as string
  const pageId = params.pageId as string

  const [page, setPage] = useState<Page | null>(null)
  const [pageContent, setPageContent] = useState<any[]>([])
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [showSectionLibrary, setShowSectionLibrary] = useState(false)
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPage()
  }, [pageId])

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/pages/${pageId}`)
      const data = await response.json()
      setPage(data)
      setPageContent(Array.isArray(data.content) ? data.content : [])
    } catch (error) {
      console.error('Error fetching page:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pageContent }),
      })
      alert('Page saved successfully!')
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSection = (sectionTemplate: any) => {
    setPageContent([...pageContent, { ...sectionTemplate.content, id: Date.now() }])
    setShowSectionLibrary(false)
  }

  const handleDeleteSection = (index: number) => {
    setPageContent(pageContent.filter((_, i) => i !== index))
    setSelectedSection(null)
  }

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newContent = [...pageContent]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newContent.length) return

    [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]]
    setPageContent(newContent)
  }

  const handleUpdateSection = (index: number, updates: any) => {
    const newContent = [...pageContent]
    newContent[index] = { ...newContent[index], ...updates }
    setPageContent(newContent)
  }

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/websites/${websiteId}/pages`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="font-bold">{page?.title}</h1>
              <p className="text-xs text-gray-600">/{page?.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Toggle */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={device === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={device === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDevice('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={device === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Link href={`/websites/${websiteId}/preview`} target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </Link>

            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Sidebar - Sections Library */}
        <div className="w-64 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <h2 className="font-bold mb-4">Sections</h2>
            <div className="space-y-2">
              {['hero', 'features', 'testimonials', 'pricing', 'contact', 'cta', 'gallery', 'team', 'faq', 'footer'].map((category) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">{category}</h3>
                  {getSectionsByCategory(category).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleAddSection(section)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg mb-1"
                    >
                      {section.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div
            className="mx-auto bg-white shadow-lg transition-all duration-200"
            style={{ width: deviceWidths[device] }}
          >
            {pageContent.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-gray-500 mb-4">No sections yet</p>
                <p className="text-sm text-gray-400">
                  Add sections from the left sidebar to start building your page
                </p>
              </div>
            ) : (
              pageContent.map((section, index) => (
                <div
                  key={section.id || index}
                  className={`relative group ${selectedSection === index ? 'ring-2 ring-pink-500' : ''}`}
                  onClick={() => setSelectedSection(index)}
                >
                  {/* Section Controls */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveSection(index, 'up')
                        }}
                      >
                        ↑
                      </Button>
                    )}
                    {index < pageContent.length - 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveSection(index, 'down')
                        }}
                      >
                        ↓
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSection(index)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Section Preview */}
                  <SectionPreview section={section} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Section Settings */}
        {selectedSection !== null && (
          <div className="w-80 border-l bg-white overflow-y-auto">
            <div className="p-4">
              <h2 className="font-bold mb-4">Section Settings</h2>
              <SectionSettings
                section={pageContent[selectedSection]}
                onChange={(updates) => handleUpdateSection(selectedSection, updates)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionPreview({ section }: { section: any }) {
  const type = section.type || 'text'

  return (
    <div className="p-8 border-b">
      {type === 'hero' && (
        <div className="text-center py-20" style={{ backgroundColor: section.backgroundColor }}>
          <h1 className="text-5xl font-bold mb-4">{section.headline || 'Headline'}</h1>
          <p className="text-xl text-gray-600 mb-8">{section.subheadline || 'Subheadline'}</p>
          <button className="bg-pink-600 text-white px-8 py-3 rounded-lg">
            {section.ctaText || 'Call to Action'}
          </button>
        </div>
      )}

      {type === 'features' && (
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-4">{section.title || 'Features'}</h2>
          <p className="text-center text-gray-600 mb-8">{section.description}</p>
          <div className={`grid ${section.variant === '4-column' ? 'grid-cols-4' : 'grid-cols-3'} gap-8`}>
            {(section.features || []).map((feature: any, i: number) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'contact' && (
        <div className="py-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{section.title || 'Contact Us'}</h2>
          <p className="text-center text-gray-600 mb-8">{section.description}</p>
          <div className="space-y-4">
            <input type="text" placeholder="Name" className="w-full border rounded-lg p-3" />
            <input type="email" placeholder="Email" className="w-full border rounded-lg p-3" />
            <textarea placeholder="Message" rows={4} className="w-full border rounded-lg p-3" />
            <button className="w-full bg-pink-600 text-white py-3 rounded-lg">
              {section.submitText || 'Send Message'}
            </button>
          </div>
        </div>
      )}

      {!['hero', 'features', 'contact'].includes(type) && (
        <div className="py-8 text-center text-gray-500">
          <p className="text-sm">{type} section</p>
          <p className="text-xs mt-2">Preview not available</p>
        </div>
      )}
    </div>
  )
}

function SectionSettings({ section, onChange }: { section: any; onChange: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      {section.headline !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1">Headline</label>
          <Input
            value={section.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
          />
        </div>
      )}

      {section.subheadline !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1">Subheadline</label>
          <Input
            value={section.subheadline}
            onChange={(e) => onChange({ subheadline: e.target.value })}
          />
        </div>
      )}

      {section.title !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1">Title</label>
          <Input
            value={section.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
      )}

      {section.description !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg p-2 text-sm"
            rows={3}
            value={section.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      )}

      {section.ctaText !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1">Button Text</label>
          <Input
            value={section.ctaText}
            onChange={(e) => onChange({ ctaText: e.target.value })}
          />
        </div>
      )}

      {section.backgroundColor !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1">Background Color</label>
          <Input
            type="color"
            value={section.backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}
