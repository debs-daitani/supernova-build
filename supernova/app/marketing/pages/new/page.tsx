'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Gift, Video, Clock } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'lead-magnet',
    name: 'Lead Magnet',
    description: 'Capture emails with a free download',
    icon: Gift,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'webinar',
    name: 'Webinar Signup',
    description: 'Register attendees for your event',
    icon: Video,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'sales',
    name: 'Sales Page',
    description: 'Sell your product or service',
    icon: FileText,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Build hype before launch',
    icon: Clock,
    color: 'from-orange-500 to-red-500',
  },
]

export default function NewLandingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setSlug(generateSlug(value))
  }

  const createPage = async () => {
    if (!title || !slug || !selectedTemplate) return

    setSaving(true)
    try {
      const response = await fetch('/api/marketing/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          template: selectedTemplate,
          content: getDefaultContent(selectedTemplate),
        }),
      })

      if (response.ok) {
        const page = await response.json()
        router.push(`/marketing/pages/${page.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create page')
      }
    } catch (error) {
      alert('Failed to create page')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/marketing/pages')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-light-teal" size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Create Landing Page</h2>
          <p className="text-sm text-gray-400 font-josefin">Step {step} of 2</p>
        </div>
      </div>

      {step === 1 ? (
        /* Step 1: Choose Template */
        <div className="space-y-6">
          <h3 className="text-lg font-supernova text-white">Choose a Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((template) => {
              const Icon = template.icon
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setStep(2)
                  }}
                  className={`text-left p-6 rounded-2xl border transition-all ${
                    selectedTemplate === template.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-light-teal/20 bg-white/5 hover:border-purple-500/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h4 className="font-supernova text-white text-lg mb-1">{template.name}</h4>
                  <p className="text-gray-400 font-josefin text-sm">{template.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Step 2: Page Details */
        <div className="max-w-xl space-y-6">
          <button
            onClick={() => setStep(1)}
            className="text-purple-400 font-josefin text-sm hover:text-purple-300"
          >
            ← Change template
          </button>

          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 space-y-4">
            <h3 className="text-lg font-supernova text-white">Page Details</h3>

            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Page Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="My Awesome Landing Page"
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">URL Slug *</label>
              <div className="flex items-center">
                <span className="text-gray-500 font-josefin text-sm mr-2">daitaniverse.space/p/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-page"
                  className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={createPage}
              disabled={saving || !title || !slug}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getDefaultContent(template: string) {
  const defaults: Record<string, any> = {
    'lead-magnet': {
      blocks: [
        { type: 'hero', data: { headline: 'Get Your Free Guide', subheadline: 'Enter your email to download instantly' } },
        { type: 'form', data: { fields: ['email', 'name'], buttonText: 'Download Now' } },
      ]
    },
    'webinar': {
      blocks: [
        { type: 'hero', data: { headline: 'Free Live Training', subheadline: 'Register now to secure your spot' } },
        { type: 'form', data: { fields: ['email', 'name'], buttonText: 'Register Free' } },
      ]
    },
    'sales': {
      blocks: [
        { type: 'hero', data: { headline: 'Transform Your Results', subheadline: 'Discover the proven system' } },
        { type: 'features', data: { items: ['Feature 1', 'Feature 2', 'Feature 3'] } },
        { type: 'cta', data: { buttonText: 'Get Started', price: '£97' } },
      ]
    },
    'coming-soon': {
      blocks: [
        { type: 'hero', data: { headline: 'Something Amazing is Coming', subheadline: 'Be the first to know when we launch' } },
        { type: 'form', data: { fields: ['email'], buttonText: 'Notify Me' } },
      ]
    },
  }

  return defaults[template] || { blocks: [] }
}
